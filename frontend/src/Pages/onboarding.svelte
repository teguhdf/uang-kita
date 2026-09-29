<script>
  import { router } from '@inertiajs/svelte'
  import {
    ArrowRight,
    CalendarDays,
    CircleAlert,
    CircleDollarSign,
    Landmark,
    LoaderCircle,
    PiggyBank,
    ShieldCheck,
    UserRound,
    UsersRound,
    WalletCards,
  } from 'lucide-svelte'
  import AppShell from '../Components/UangKita/AppShell.svelte'

  let { overview, flash } = $props()
  let isLoading = $state(false)

  function localDateInput(date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function defaultNextIncomeDate() {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return localDateInput(date)
  }

  let form = $state({
    partner_name: overview?.partnerName || '',
    monthly_income: overview?.plan?.monthly_income || 0,
    available_money: overview?.plan?.available_money || 0,
    fixed_commitments: overview?.plan?.fixed_commitments || 0,
    debt_payments: overview?.plan?.debt_payments || 0,
    savings_target: overview?.plan?.savings_target || 0,
    safety_buffer: overview?.plan?.safety_buffer || 0,
    personal_owner: overview?.plan?.personal_owner || 0,
    personal_partner: overview?.plan?.personal_partner || 0,
    next_income_date: overview?.plan?.next_income_date || defaultNextIncomeDate(),
  })

  let totalAllocated = $derived(
    Number(form.fixed_commitments || 0) +
    Number(form.debt_payments || 0) +
    Number(form.savings_target || 0) +
    Number(form.safety_buffer || 0) +
    Number(form.personal_owner || 0) +
    Number(form.personal_partner || 0)
  )

  let flexibleAmount = $derived(Math.max(0, Number(form.available_money || 0) - totalAllocated))
  let deficitAmount = $derived(Math.max(0, totalAllocated - Number(form.available_money || 0)))
  let daysRemaining = $derived(daysUntil(form.next_income_date))
  let safeDaily = $derived(Math.floor(flexibleAmount / Math.max(1, daysRemaining)))
  let safeWeekly = $derived(Math.floor(flexibleAmount / Math.max(1, daysRemaining / 7)))

  function daysUntil(value) {
    if (!value) return 1
    const target = new Date(`${value}T00:00:00`)
    if (Number.isNaN(target.getTime())) return 1
    const now = new Date()
    const dayMs = 24 * 60 * 60 * 1000
    return Math.max(1, Math.ceil((target.getTime() - now.getTime()) / dayMs))
  }

  function rupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  function submitForm() {
    isLoading = true
    router.post('/onboarding', form, {
      preserveScroll: true,
      onFinish: () => {
        isLoading = false
      },
    })
  }
</script>

<svelte:head>
  <title>Susun bulan ini · UANG KITA</title>
  <meta name="description" content="Susun kondisi uang bulan ini dan hitung Angka Aman kalian." />
</svelte:head>

<AppShell active="plan">
  <div class="mx-auto max-w-4xl">
    <section class="mb-6 sm:mb-8">
      <p class="text-xs font-medium text-[#9A665D]">Rencana bulan ini</p>
      <h1 class="mt-2 max-w-2xl text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#292421] sm:text-4xl">
        Biar angka yang sama punya arti yang sama buat kalian.
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[#766D66] sm:text-[15px]">
        Mulai dari uang yang benar-benar tersedia sekarang. Setelah itu pisahkan yang sudah punya tujuan, ruang personal, dan yang masih fleksibel sampai pemasukan berikutnya.
      </p>
    </section>

    {#if flash?.error}
      <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#E9C9C4] bg-[#FFF4F2] p-4 text-[#84463E]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{flash.error}</p>
      </div>
    {/if}

    <form class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" onsubmit={(event) => { event.preventDefault(); submitForm(); }}>
      <div class="space-y-4">
        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <UsersRound size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Ruang kalian</h2>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Untuk MVP ini, cukup tulis nama pasangan. Undang akun pasangan akan kita aktifkan setelah core flow terbukti.</p>
            </div>
          </div>

          <div class="mt-5">
            <label for="partner_name" class="mb-2 block text-sm font-medium text-[#4A433E]">Nama pasangan</label>
            <div class="relative">
              <UserRound class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2978E]" size={18} />
              <input id="partner_name" name="partner_name" type="text" required bind:value={form.partner_name} placeholder="Contoh: Nadia" class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9C9189] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
            </div>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <CircleDollarSign size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Mulai dari uang yang memang ada</h2>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Angka Aman memakai “uang tersedia saat ini”, bukan menjumlahkan gaji dan saldo supaya uang yang sama tidak terhitung dua kali.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="available_money" class="mb-2 block text-sm font-medium text-[#4A433E]">Uang tersedia saat ini</label>
              <input id="available_money" name="available_money" type="number" min="0" step="1000" required bind:value={form.available_money} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] text-[#2D2825] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.available_money)}</p>
            </div>

            <div>
              <label for="monthly_income" class="mb-2 block text-sm font-medium text-[#4A433E]">Pemasukan rutin bulan ini</label>
              <input id="monthly_income" name="monthly_income" type="number" min="0" step="1000" bind:value={form.monthly_income} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] text-[#2D2825] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">Disimpan sebagai konteks. {rupiah(form.monthly_income)}</p>
            </div>
          </div>

          <div class="mt-4">
            <label for="next_income_date" class="mb-2 block text-sm font-medium text-[#4A433E]">Pemasukan berikutnya</label>
            <div class="relative">
              <CalendarDays class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2978E]" size={18} />
              <input id="next_income_date" name="next_income_date" type="date" min={localDateInput()} required bind:value={form.next_income_date} class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
            </div>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <Landmark size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Yang sudah punya tujuan</h2>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Masukkan total untuk periode sampai pemasukan berikutnya. Nggak perlu pecah sampai level struk belanja.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fixed_commitments" class="mb-2 block text-sm font-medium text-[#4A433E]">Kebutuhan & tagihan wajib</label>
              <input id="fixed_commitments" type="number" min="0" step="1000" bind:value={form.fixed_commitments} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.fixed_commitments)}</p>
            </div>
            <div>
              <label for="debt_payments" class="mb-2 block text-sm font-medium text-[#4A433E]">Cicilan / utang</label>
              <input id="debt_payments" type="number" min="0" step="1000" bind:value={form.debt_payments} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.debt_payments)}</p>
            </div>
            <div>
              <label for="savings_target" class="mb-2 block text-sm font-medium text-[#4A433E]">Target tabungan bersama</label>
              <input id="savings_target" type="number" min="0" step="1000" bind:value={form.savings_target} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.savings_target)}</p>
            </div>
            <div>
              <label for="safety_buffer" class="mb-2 block text-sm font-medium text-[#4A433E]">Safety buffer</label>
              <input id="safety_buffer" type="number" min="0" step="1000" bind:value={form.safety_buffer} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.safety_buffer)}</p>
            </div>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <WalletCards size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Ruang personal</h2>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Supaya tidak semua pengeluaran kecil terasa seperti harus minta izin. Nilainya kalian tentukan sendiri.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="personal_owner" class="mb-2 block text-sm font-medium text-[#4A433E]">Uang kamu</label>
              <input id="personal_owner" type="number" min="0" step="1000" bind:value={form.personal_owner} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.personal_owner)}</p>
            </div>
            <div>
              <label for="personal_partner" class="mb-2 block text-sm font-medium text-[#4A433E]">Uang {form.partner_name || 'pasangan'}</label>
              <input id="personal_partner" type="number" min="0" step="1000" bind:value={form.personal_partner} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.personal_partner)}</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="lg:sticky lg:top-10 lg:self-start">
        <div class="overflow-hidden rounded-[26px] border border-[#DED2C8] bg-[#342E2A] text-[#F8F3EE] shadow-[0_16px_50px_rgba(52,46,42,0.12)]">
          <div class="p-5 sm:p-6">
            <div class="flex items-center gap-2 text-[#D7C0B4]">
              <ShieldCheck size={17} strokeWidth={1.8} />
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em]">Preview Angka Aman</p>
            </div>

            {#if deficitAmount > 0}
              <p class="mt-5 text-sm font-medium text-[#F2C7BE]">Alokasi kalian melewati uang yang tersedia.</p>
              <p class="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">-{rupiah(deficitAmount)}</p>
              <p class="mt-3 text-xs leading-5 text-[#D6CBC4]">Kurangi salah satu alokasi sampai ada ruang yang realistis sebelum menyimpan.</p>
            {:else}
              <p class="mt-5 text-xs text-[#CFC2BA]">Aman digunakan per minggu</p>
              <p class="mt-1 text-3xl font-semibold tracking-[-0.045em] text-white">{rupiah(safeWeekly)}</p>
              <p class="mt-2 text-xs leading-5 text-[#D6CBC4]">Sekitar {rupiah(safeDaily)} per hari selama {daysRemaining} hari menuju pemasukan berikutnya.</p>
            {/if}

            <div class="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs">
              <div class="flex items-center justify-between gap-4">
                <span class="text-[#BFB2AA]">Uang tersedia</span>
                <span class="font-medium text-white">{rupiah(form.available_money)}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-[#BFB2AA]">Sudah dialokasikan</span>
                <span class="font-medium text-white">{rupiah(totalAllocated)}</span>
              </div>
              <div class="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span class="text-[#D7C0B4]">Masih fleksibel</span>
                <span class="font-semibold text-white">{rupiah(flexibleAmount)}</span>
              </div>
            </div>
          </div>

          <div class="bg-white/[0.05] p-4 sm:p-5">
            <button type="submit" disabled={isLoading || deficitAmount > 0} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F7F0EA] px-4 py-3.5 text-sm font-semibold text-[#5F342E] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50">
              {#if isLoading}
                <LoaderCircle class="animate-spin" size={18} />
                Menyimpan...
              {:else}
                {overview?.plan ? 'Perbarui bulan ini' : 'Simpan & lihat Angka Aman'}
                <ArrowRight size={17} />
              {/if}
            </button>
          </div>
        </div>

        <div class="mt-3 rounded-2xl border border-[#E5DAD1] bg-[#FBF8F4] p-4">
          <div class="flex items-start gap-3">
            <PiggyBank class="mt-0.5 shrink-0 text-[#91645B]" size={17} strokeWidth={1.8} />
            <p class="text-xs leading-5 text-[#81766E]">Ini bukan budgeting harian detail. Kita cuma mencari satu angka yang membantu kalian mengambil keputusan sampai pemasukan berikutnya.</p>
          </div>
        </div>
      </aside>
    </form>
  </div>
</AppShell>
