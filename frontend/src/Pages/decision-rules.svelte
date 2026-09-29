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
  <meta name="description" content="Hubungkan akun pasangan dan atur batas keputusan yang dipakai bersama." />
</svelte:head>

<AppShell active="couple">
  <div class="mx-auto max-w-5xl">
    <section class="mb-6">
      <p class="text-xs font-semibold text-[#E1463D]">Kita</p>
      <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Atur cara kalian mengambil keputusan.</h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[#68635F] sm:text-[15px]">
        Hubungkan akun pasangan dan tentukan kapan pembelian bebas diputuskan sendiri, cukup dikabari, atau perlu dibicarakan dulu.
      </p>
    </section>

    {#if flash?.error}
      <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} />
        <p class="text-sm leading-5">{flash.error}</p>
      </div>
    {/if}

    {#if flash?.success}
      <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#DDE8D9] bg-[#F4F8F2] p-4 text-[#486043]">
        <CheckCircle2 class="mt-0.5 shrink-0" size={18} />
        <p class="text-sm leading-5">{flash.success}</p>
      </div>
    {/if}

    <section class="uk-card mb-4 p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><UsersRound size={20} /></div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-semibold text-[#1F1F1F]">Partner: {overview?.partnerName || 'Pasangan'}</h2>
              {#if partnerConnected}
                <span class="rounded-full bg-[#EEF7F0] px-2.5 py-1 text-[10px] font-semibold text-[#4D8B5B]">Terhubung</span>
              {:else}
                <span class="rounded-full bg-[#F3F1EF] px-2.5 py-1 text-[10px] font-semibold text-[#77716D]">Belum terhubung</span>
              {/if}
            </div>
            <p class="mt-1.5 max-w-2xl text-xs leading-5 text-[#77716D]">
              {#if partnerConnected}
                Akun pasangan sudah terhubung. Rencana, Angka Aman, dan aturan keputusan sekarang dibaca dari household yang sama.
              {:else}
                Minta pasangan membuat akun UANG KITA terlebih dulu. Setelah itu masukkan email akun pasangan di bawah untuk menghubungkannya ke ruang kalian.
              {/if}
            </p>
          </div>
        </div>
      </div>

      {#if !partnerConnected}
        <form class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]" onsubmit={(event) => { event.preventDefault(); submitInvite(); }}>
          <div>
            <label for="partner_email" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Email akun pasangan</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
              <input id="partner_email" type="email" required bind:value={inviteForm.email} placeholder="pasangan@email.com" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
            </div>
            <p class="mt-2 text-[11px] leading-5 text-[#817C77]">Gunakan email yang sudah terdaftar sebagai akun UANG KITA milik pasangan.</p>
          </div>
          <button type="submit" disabled={inviteLoading || !inviteForm.email.trim()} class="self-end rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-50">
            {#if inviteLoading}<span class="inline-flex items-center gap-2"><LoaderCircle class="animate-spin" size={17} /> Menghubungkan...</span>{:else}Hubungkan pasangan{/if}
          </button>
        </form>
      {/if}
    </section>

    <form class="grid gap-4 lg:grid-cols-[1fr_0.92fr]" onsubmit={(event) => { event.preventDefault(); submitForm(); }}>
      <section class="uk-card p-5 sm:p-6">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><ShieldCheck size={20} /></div>
          <div>
            <h2 class="text-base font-semibold text-[#1F1F1F]">Dua batas, tiga cara mengambil keputusan</h2>
            <p class="mt-1 text-xs leading-5 text-[#77716D]">Aturan ini adalah pengingat komunikasi, bukan izin sepihak atau larangan otomatis.</p>
          </div>
        </div>

        <div class="mt-6 space-y-5">
          <div>
            <div class="mb-2 flex items-start justify-between gap-4">
              <div>
                <label for="free_limit" class="block text-sm font-semibold text-[#3F3B38]">Batas Bebas</label>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Sampai nominal ini, masing-masing boleh memutuskan sendiri.</p>
              </div>
              <ShieldCheck class="mt-1 shrink-0 text-[#6C9A72]" size={18} />
            </div>
            <input id="free_limit" type="number" min="0" step="1000" bind:value={form.free_limit} class="uk-input px-4 py-3.5 text-[15px]" />
            <p class="mt-1.5 text-[11px] font-medium text-[#817C77]">{rupiah(form.free_limit)}</p>
          </div>

          <div class="border-t border-[#F0ECE8] pt-5">
            <div class="mb-2 flex items-start justify-between gap-4">
              <div>
                <label for="notify_limit" class="block text-sm font-semibold text-[#3F3B38]">Batas Kasih Tahu</label>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Di atas Batas Bebas sampai nominal ini, cukup kasih tahu pasangan.</p>
              </div>
              <Bell class="mt-1 shrink-0 text-[#D0922C]" size={18} />
            </div>
            <input id="notify_limit" type="number" min="0" step="1000" bind:value={form.notify_limit} class="uk-input px-4 py-3.5 text-[15px] {isValid ? '' : '!border-[#E16A61]'}" />
            <p class="mt-1.5 text-[11px] font-medium {isValid ? 'text-[#817C77]' : 'text-[#B53D35]'}">{#if isValid}{rupiah(form.notify_limit)}{:else}Harus sama atau lebih besar dari Batas Bebas.{/if}</p>
          </div>
        </div>

        <div class="mt-6 rounded-2xl bg-[#FAFAF8] p-4">
          <div class="flex items-start gap-3">
            <MessageCircleMore class="mt-0.5 shrink-0 text-[#E1463D]" size={18} />
            <div>
              <p class="text-sm font-semibold text-[#1F1F1F]">Di atas Batas Kasih Tahu</p>
              <p class="mt-1 text-xs leading-5 text-[#77716D]">UANG KITA akan memberi sinyal “ngobrol dulu”. Bukan berarti pembeliannya otomatis dilarang.</p>
            </div>
          </div>
        </div>
      </section>

      <aside class="lg:sticky lg:top-8 lg:self-start">
        <section class="uk-card p-5 sm:p-6">
          <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E1463D]">Preview aturan kalian</p>

          <div class="mt-5 space-y-3">
            <div class="rounded-2xl border border-[#DDE8D9] bg-[#F4F8F2] p-4">
              <p class="text-xs font-semibold text-[#4D6C4A]">Bebas diputuskan sendiri</p>
              <p class="mt-1.5 text-lg font-semibold text-[#1F1F1F]">≤ {rupiah(form.free_limit)}</p>
            </div>
            <div class="rounded-2xl border border-[#F1E2C7] bg-[#FFF8ED] p-4">
              <p class="text-xs font-semibold text-[#9A691D]">Kasih tahu pasangan</p>
              <p class="mt-1.5 text-lg font-semibold text-[#1F1F1F]">&gt; {rupiah(form.free_limit)} sampai {rupiah(form.notify_limit)}</p>
            </div>
            <div class="rounded-2xl border border-[#F2D8D4] bg-[#FFF5F3] p-4">
              <p class="text-xs font-semibold text-[#B24139]">Ngobrol dulu</p>
              <p class="mt-1.5 text-lg font-semibold text-[#1F1F1F]">&gt; {rupiah(form.notify_limit)}</p>
            </div>
          </div>

          <button type="submit" disabled={isLoading || !isValid} class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-50">
            {#if isLoading}<LoaderCircle class="animate-spin" size={18} /> Menyimpan...{:else}<Save size={17} /> Simpan aturan{/if}
          </button>

          <div class="mt-3 min-h-[44px]" aria-live="polite">
            {#if flash?.success}
              <div class="flex items-start gap-2 rounded-2xl bg-[#F4F8F2] px-3.5 py-3 text-[#486043]"><CheckCircle2 class="mt-0.5 shrink-0" size={16} /><p class="text-xs leading-5">{flash.success}</p></div>
            {:else if flash?.error}
              <div class="flex items-start gap-2 rounded-2xl bg-[#FFF5F3] px-3.5 py-3 text-[#9E3A33]"><CircleAlert class="mt-0.5 shrink-0" size={16} /><p class="text-xs leading-5">{flash.error}</p></div>
            {:else}
              <p class="px-1 text-[11px] leading-5 text-[#817C77]">Setelah tersimpan, aturan ini langsung dipakai di menu Keputusan.</p>
            {/if}
          </div>
        </section>
      </aside>
    </form>
  </div>
</AppShell>
