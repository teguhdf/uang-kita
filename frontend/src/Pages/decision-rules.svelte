<script>
  import { router } from '@inertiajs/svelte'
  import {
    Bell,
    CheckCircle2,
    CircleAlert,
    LoaderCircle,
    Mail,
    MessageCircleMore,
    Save,
    ShieldCheck,
    UsersRound,
  } from 'lucide-svelte'
  import AppShell from '../Components/UangKita/AppShell.svelte'

  let { overview, flash } = $props()
  let isLoading = $state(false)
  let inviteLoading = $state(false)

  let form = $state({
    free_limit: Number(overview?.decisionRule?.free_limit || 0),
    notify_limit: Number(overview?.decisionRule?.notify_limit || 0),
  })

  let inviteForm = $state({
    email: overview?.partnerInviteEmail || '',
  })

  let isValid = $derived(Number(form.notify_limit || 0) >= Number(form.free_limit || 0))
  let partnerConnected = $derived(overview?.partnerStatus === 'active')

  function rupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  function submitForm() {
    if (!isValid || isLoading) return
    isLoading = true
    router.post('/aturan-keputusan', form, {
      preserveScroll: true,
      onFinish: () => {
        isLoading = false
      },
    })
  }

  function submitInvite() {
    if (!inviteForm.email.trim() || inviteLoading || partnerConnected) return
    inviteLoading = true
    router.post('/invite-partner', inviteForm, {
      preserveScroll: true,
      onFinish: () => {
        inviteLoading = false
      },
    })
  }
</script>

<svelte:head>
  <title>Kita · UANG KITA</title>
  <meta name="description" content="Hubungkan akun pasangan dan buat batas keputusan uang yang disepakati berdua." />
</svelte:head>

<AppShell active="couple">
  <div class="mx-auto max-w-4xl">
    <section class="mb-6 sm:mb-8">
      <p class="text-xs font-medium text-[#9A665D]">Ruang kalian</p>
      <h1 class="mt-2 max-w-2xl text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#292421] sm:text-4xl">
        Satu kondisi uang, dilihat oleh dua orang.
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[#766D66] sm:text-[15px]">
        Hubungkan akun pasangan, lalu sepakati kapan pembelian cukup diputuskan sendiri, kapan kasih tahu, dan kapan perlu ngobrol dulu.
      </p>
    </section>

    {#if flash?.error}
      <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#E9C9C4] bg-[#FFF4F2] p-4 text-[#84463E]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{flash.error}</p>
      </div>
    {/if}

    {#if flash?.success}
      <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#D9E5D7] bg-[#F4F8F2] p-4 text-[#4E664B]">
        <CheckCircle2 class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{flash.success}</p>
      </div>
    {/if}

    <section class="mb-5 rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
          <UsersRound size={19} strokeWidth={1.8} />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Hubungkan {overview?.partnerName || 'pasangan'}</h2>
            {#if partnerConnected}
              <span class="rounded-full bg-[#E8F0E5] px-2.5 py-1 text-[10px] font-semibold text-[#4D674A]">Terhubung</span>
            {:else if overview?.partnerInviteEmail}
              <span class="rounded-full bg-[#F2E7DF] px-2.5 py-1 text-[10px] font-semibold text-[#7B4038]">Menunggu pasangan</span>
            {:else}
              <span class="rounded-full bg-[#F0ECE8] px-2.5 py-1 text-[10px] font-semibold text-[#817970]">Belum diundang</span>
            {/if}
          </div>

          {#if partnerConnected}
            <p class="mt-2 text-xs leading-5 text-[#7D746D]">
              Akun pasangan sudah memakai household yang sama. Rencana, Angka Aman, dan aturan keputusan sekarang dibaca dari data bersama.
            </p>
          {:else}
            <p class="mt-2 text-xs leading-5 text-[#7D746D]">
              Masukkan email yang akan dipakai pasangan untuk daftar atau login. Setelah auth berhasil dengan email yang sama, akun akan terhubung otomatis.
            </p>

            <form class="mt-4 sm:flex sm:items-end sm:gap-3" onsubmit={(event) => { event.preventDefault(); submitInvite(); }}>
              <div class="flex-1">
                <label for="partner_email" class="mb-2 block text-sm font-medium text-[#4A433E]">Email pasangan</label>
                <div class="relative">
                  <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2978E]" size={18} />
                  <input
                    id="partner_email"
                    type="email"
                    required
                    bind:value={inviteForm.email}
                    placeholder="pasangan@email.com"
                    class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9C9189] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inviteLoading || !inviteForm.email.trim()}
                class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7B4038] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6F3933] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
              >
                {#if inviteLoading}
                  <LoaderCircle class="animate-spin" size={17} />
                  Menyimpan...
                {:else if overview?.partnerInviteEmail}
                  Perbarui email
                {:else}
                  Undang pasangan
                {/if}
              </button>
            </form>

            {#if overview?.partnerInviteEmail}
              <p class="mt-3 text-[11px] leading-5 text-[#8F847C]">
                Menunggu login/pendaftaran dari <strong class="font-semibold text-[#5C534D]">{overview.partnerInviteEmail}</strong>. Untuk MVP sprint ini, undangan belum dikirim otomatis lewat email.
              </p>
            {/if}
          {/if}
        </div>
      </div>
    </section>

    <form class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" onsubmit={(event) => { event.preventDefault(); submitForm(); }}>
      <div class="space-y-4">
        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <UsersRound size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Dua batas, tiga cara mengambil keputusan</h2>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Aturan ini berlaku sebagai pengingat komunikasi, bukan izin sepihak atau larangan.</p>
            </div>
          </div>

          <div class="mt-6 space-y-5">
            <div>
              <div class="mb-2 flex items-start justify-between gap-4">
                <div>
                  <label for="free_limit" class="block text-sm font-semibold text-[#443D38]">Batas Bebas</label>
                  <p class="mt-1 text-xs leading-5 text-[#8A8078]">Sampai nominal ini, masing-masing boleh memutuskan sendiri.</p>
                </div>
                <ShieldCheck class="mt-1 shrink-0 text-[#8C665E]" size={18} strokeWidth={1.7} />
              </div>
              <input id="free_limit" type="number" min="0" step="1000" bind:value={form.free_limit} class="w-full rounded-2xl border border-[#DED4CB] bg-white px-4 py-3.5 text-[15px] text-[#2D2825] outline-none transition focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(form.free_limit)}</p>
            </div>

            <div class="border-t border-[#EEE5DE] pt-5">
              <div class="mb-2 flex items-start justify-between gap-4">
                <div>
                  <label for="notify_limit" class="block text-sm font-semibold text-[#443D38]">Batas Kasih Tahu</label>
                  <p class="mt-1 text-xs leading-5 text-[#8A8078]">Di atas Batas Bebas sampai nominal ini, cukup kasih tahu pasangan.</p>
                </div>
                <Bell class="mt-1 shrink-0 text-[#8C665E]" size={18} strokeWidth={1.7} />
              </div>
              <input id="notify_limit" type="number" min="0" step="1000" bind:value={form.notify_limit} class="w-full rounded-2xl border bg-white px-4 py-3.5 text-[15px] text-[#2D2825] outline-none transition {isValid ? 'border-[#DED4CB] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10' : 'border-[#C9867B] focus:ring-4 focus:ring-[#C9867B]/10'}" />
              <p class="mt-1.5 text-[11px] {isValid ? 'text-[#978D85]' : 'text-[#9B4D43]'}">
                {#if isValid}
                  {rupiah(form.notify_limit)}
                {:else}
                  Harus sama atau lebih besar dari Batas Bebas.
                {/if}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#E5DAD1] bg-white p-5 sm:p-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <MessageCircleMore size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Di atas Batas Kasih Tahu</h2>
              <p class="mt-0.5 text-xs leading-5 text-[#90867E]">Aplikasi akan memberi sinyal “ngobrol dulu”. Bukan berarti pembeliannya dilarang.</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="lg:sticky lg:top-8 lg:self-start">
        <section class="rounded-[28px] bg-[#342E2A] p-5 text-[#F8F3EE] shadow-[0_18px_60px_rgba(52,46,42,0.12)] sm:p-6">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CDB8AB]">Preview aturan kalian</p>

          <div class="mt-5 space-y-3">
            <div class="rounded-2xl bg-white/8 p-4">
              <p class="text-xs font-semibold text-[#E9DCD4]">Bebas diputuskan sendiri</p>
              <p class="mt-1.5 text-lg font-semibold">≤ {rupiah(form.free_limit)}</p>
            </div>
            <div class="rounded-2xl bg-white/8 p-4">
              <p class="text-xs font-semibold text-[#E9DCD4]">Kasih tahu pasangan</p>
              <p class="mt-1.5 text-lg font-semibold">&gt; {rupiah(form.free_limit)} sampai {rupiah(form.notify_limit)}</p>
            </div>
            <div class="rounded-2xl bg-white/8 p-4">
              <p class="text-xs font-semibold text-[#E9DCD4]">Ngobrol dulu</p>
              <p class="mt-1.5 text-lg font-semibold">&gt; {rupiah(form.notify_limit)}</p>
            </div>
          </div>

          <p class="mt-5 text-xs leading-5 text-[#D2C6BE]">Nominal ini bisa kalian ubah kapan saja. Simulator “Aman Kalau Dibeli?” akan memakai aturan terbaru.</p>

          <button type="submit" disabled={isLoading || !isValid} class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EFE2DA] px-5 py-3.5 text-sm font-semibold text-[#683C35] transition hover:bg-[#F5EAE4] disabled:cursor-not-allowed disabled:opacity-50">
            {#if isLoading}
              <LoaderCircle class="animate-spin" size={18} />
              Menyimpan...
            {:else}
              <Save size={17} />
              Simpan aturan
            {/if}
          </button>

          <div class="mt-3 min-h-[44px]" aria-live="polite">
            {#if flash?.success}
              <div class="flex items-start gap-2 rounded-2xl bg-[#EAF2E7] px-3.5 py-3 text-[#456144]">
                <CheckCircle2 class="mt-0.5 shrink-0" size={16} strokeWidth={1.9} />
                <p class="text-xs leading-5">{flash.success}</p>
              </div>
            {:else if flash?.error}
              <div class="flex items-start gap-2 rounded-2xl bg-[#F8E5E1] px-3.5 py-3 text-[#8B4D45]">
                <CircleAlert class="mt-0.5 shrink-0" size={16} strokeWidth={1.9} />
                <p class="text-xs leading-5">{flash.error}</p>
              </div>
            {:else}
              <p class="px-1 text-[11px] leading-5 text-[#BFB2AA]">Setelah tersimpan, aturan ini langsung dipakai di menu Keputusan.</p>
            {/if}
          </div>
        </section>
      </aside>
    </form>
  </div>
</AppShell>
