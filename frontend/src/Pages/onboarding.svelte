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
  <title>Rencana bulan ini · UANG KITA</title>
  <meta name="description" content="Susun kondisi uang bulan ini dan hitung Angka Aman kalian." />
</svelte:head>

<AppShell active="plan">
  <div class="mx-auto max-w-5xl">
    <section class="mb-6">
      <p class="text-xs font-semibold text-[#E1463D]">Rencana</p>
      <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Susun kondisi bulan ini.</h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[#68635F] sm:text-[15px]">
        Mulai dari uang yang benar-benar tersedia sekarang. Pisahkan kebutuhan, cicilan, target, buffer, dan ruang personal supaya Angka Aman punya dasar yang jelas.
      </p>
    </section>

    {#if flash?.error}
      <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} />
        <p class="text-sm leading-5">{flash.error}</p>
      </div>
    {/if}

    <form class="grid gap-4 lg:grid-cols-[1fr_330px]" onsubmit={(event) => { event.preventDefault(); submitForm(); }}>
      <div class="space-y-4">
        <section class="uk-card p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><UsersRound size={20} /></div>
            <div>
              <h2 class="text-base font-semibold text-[#1F1F1F]">Ruang kalian</h2>
              <p class="mt-1 text-xs leading-5 text-[#77716D]">Nama ini dipakai untuk menyebut pasangan di seluruh aplikasi.</p>
            </div>
          </div>

          <div class="mt-5">
            <label for="partner_name" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Nama pasangan</label>
            <div class="relative">
              <UserRound class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
              <input id="partner_name" name="partner_name" type="text" required bind:value={form.partner_name} placeholder="Contoh: Nadia" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
            </div>
          </div>
        </section>

        <section class="uk-card p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF7F0] text-[#4D8B5B]"><CircleDollarSign size={20} /></div>
            <div>
              <h2 class="text-base font-semibold text-[#1F1F1F]">Uang yang memang tersedia</h2>
              <p class="mt-1 text-xs leading-5 text-[#77716D]">Angka Aman memakai uang tersedia saat ini, bukan menjumlahkan gaji dan saldo yang bisa jadi uang yang sama.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="available_money" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Uang tersedia saat ini</label>
              <input id="available_money" name="available_money" type="number" min="0" step="1000" required bind:value={form.available_money} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] font-medium text-[#817C77]">{rupiah(form.available_money)}</p>
            </div>

            <div>
              <label for="monthly_income" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Pemasukan rutin bulan ini</label>
              <input id="monthly_income" name="monthly_income" type="number" min="0" step="1000" bind:value={form.monthly_income} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] font-medium text-[#817C77]">Konteks: {rupiah(form.monthly_income)}</p>
            </div>
          </div>

          <div class="mt-4">
            <label for="next_income_date" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Pemasukan berikutnya</label>
            <div class="relative">
              <CalendarDays class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
              <input id="next_income_date" name="next_income_date" type="date" min={localDateInput()} required bind:value={form.next_income_date} class="uk-input py-3.5 pl-12 pr-4 text-[15px]" />
            </div>
          </div>
        </section>

        <section class="uk-card p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5E9] text-[#C88B2A]"><Landmark size={20} /></div>
            <div>
              <h2 class="text-base font-semibold text-[#1F1F1F]">Yang sudah punya tujuan</h2>
              <p class="mt-1 text-xs leading-5 text-[#77716D]">Masukkan total hingga pemasukan berikutnya. Nggak perlu mencatat sampai level struk belanja.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fixed_commitments" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Kebutuhan & tagihan wajib</label>
              <input id="fixed_commitments" type="number" min="0" step="1000" bind:value={form.fixed_commitments} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] text-[#817C77]">{rupiah(form.fixed_commitments)}</p>
            </div>
            <div>
              <label for="debt_payments" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Cicilan / utang</label>
              <input id="debt_payments" type="number" min="0" step="1000" bind:value={form.debt_payments} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] text-[#817C77]">{rupiah(form.debt_payments)}</p>
            </div>
            <div>
              <label for="savings_target" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Target tabungan bersama</label>
              <input id="savings_target" type="number" min="0" step="1000" bind:value={form.savings_target} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] text-[#817C77]">{rupiah(form.savings_target)}</p>
            </div>
            <div>
              <label for="safety_buffer" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Safety buffer</label>
              <input id="safety_buffer" type="number" min="0" step="1000" bind:value={form.safety_buffer} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] text-[#817C77]">{rupiah(form.safety_buffer)}</p>
            </div>
          </div>
        </section>

        <section class="uk-card p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F5F2EF] text-[#6D6964]"><WalletCards size={20} /></div>
            <div>
              <h2 class="text-base font-semibold text-[#1F1F1F]">Ruang personal</h2>
              <p class="mt-1 text-xs leading-5 text-[#77716D]">Supaya tidak semua pengeluaran kecil terasa seperti harus minta izin.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="personal_owner" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Uang kamu</label>
              <input id="personal_owner" type="number" min="0" step="1000" bind:value={form.personal_owner} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] text-[#817C77]">{rupiah(form.personal_owner)}</p>
            </div>
            <div>
              <label for="personal_partner" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Uang {form.partner_name || 'pasangan'}</label>
              <input id="personal_partner" type="number" min="0" step="1000" bind:value={form.personal_partner} class="uk-input px-4 py-3.5 text-[15px]" />
              <p class="mt-1.5 text-[11px] text-[#817C77]">{rupiah(form.personal_partner)}</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="lg:sticky lg:top-8 lg:self-start">
        <section class="uk-card overflow-hidden">
          <div class="p-5 sm:p-6">
            <div class="flex items-center gap-2 text-[#E1463D]">
              <ShieldCheck size={17} />
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em]">Preview Angka Aman</p>
            </div>

            {#if deficitAmount > 0}
              <p class="mt-5 text-sm font-semibold text-[#B24139]">Alokasi melewati uang yang tersedia.</p>
              <p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#1F1F1F]">-{rupiah(deficitAmount)}</p>
              <p class="mt-3 text-xs leading-5 text-[#77716D]">Kurangi salah satu alokasi sebelum menyimpan rencana.</p>
            {:else}
              <p class="mt-5 text-xs font-medium text-[#77716D]">Aman digunakan per minggu</p>
              <p class="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[#1F1F1F]">{rupiah(safeWeekly)}</p>
              <p class="mt-2 text-xs leading-5 text-[#77716D]">Sekitar {rupiah(safeDaily)} per hari selama {daysRemaining} hari menuju pemasukan berikutnya.</p>
            {/if}

            <div class="mt-6 space-y-3 border-t border-[#F0ECE8] pt-5 text-xs">
              <div class="flex items-center justify-between gap-4"><span class="text-[#77716D]">Uang tersedia</span><span class="font-semibold text-[#1F1F1F]">{rupiah(form.available_money)}</span></div>
              <div class="flex items-center justify-between gap-4"><span class="text-[#77716D]">Sudah dialokasikan</span><span class="font-semibold text-[#1F1F1F]">{rupiah(totalAllocated)}</span></div>
              <div class="flex items-center justify-between gap-4 border-t border-[#F0ECE8] pt-3"><span class="font-semibold text-[#3F3B38]">Masih fleksibel</span><span class="font-semibold text-[#E1463D]">{rupiah(flexibleAmount)}</span></div>
            </div>
          </div>

          <div class="border-t border-[#F0ECE8] bg-[#FAFAF8] p-4 sm:p-5">
            <button type="submit" disabled={isLoading || deficitAmount > 0} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-50">
              {#if isLoading}<LoaderCircle class="animate-spin" size={18} /> Menyimpan...{:else}{overview?.plan ? 'Perbarui bulan ini' : 'Simpan & lihat Angka Aman'} <ArrowRight size={17} />{/if}
            </button>
          </div>
        </section>

        <div class="mt-3 rounded-2xl border border-[#EEEAE6] bg-[#FAFAF8] p-4">
          <div class="flex items-start gap-3">
            <PiggyBank class="mt-0.5 shrink-0 text-[#E1463D]" size={17} />
            <p class="text-xs leading-5 text-[#77716D]">Ini bukan budgeting harian detail. Tujuannya menemukan angka yang membantu kalian mengambil keputusan sampai pemasukan berikutnya.</p>
          </div>
        </div>
      </aside>
    </form>
  </div>
</AppShell>
