<script>
  import { router } from '@inertiajs/svelte'
  import { Check, HeartHandshake, LoaderCircle, X } from 'lucide-svelte'
  import AuthShell from '../Components/UangKita/AuthShell.svelte'

  let { invite, flash } = $props()
  let action = $state(null)

  function acceptInvite() {
    if (action) return
    action = 'accept'
    router.post('/undangan-pasangan/terima', {}, {
      onFinish: () => { action = null },
    })
  }

  function rejectInvite() {
    if (action) return
    action = 'reject'
    router.post('/undangan-pasangan/tolak', {}, {
      onFinish: () => { action = null },
    })
  }
</script>

<svelte:head>
  <title>Undangan pasangan · UANG KITA</title>
  <meta name="description" content="Konfirmasi undangan untuk berbagi ruang UANG KITA bersama pasangan." />
</svelte:head>

<AuthShell>
  <section class="rounded-[28px] border border-[#EAE6E1] bg-white p-5 shadow-[0_18px_55px_rgba(31,31,31,0.06)] sm:p-7">
    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]">
      <HeartHandshake size={22} strokeWidth={1.8} />
    </div>

    <p class="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#E1463D]">Undangan UANG KITA</p>
    <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[36px]">
      Mau bergabung ke ruang uang bersama pasangan?
    </h1>
    <p class="mt-4 text-sm leading-6 text-[#68635F]">
      Akun <strong class="font-semibold text-[#1F1F1F]">{invite?.inviteEmail}</strong> mendapat undangan untuk menjadi pasangan di UANG KITA. Kalau diterima, kalian akan melihat rencana bulan, Angka Aman, aturan keputusan, dan riwayat keputusan dari household yang sama.
    </p>

    <div class="mt-5 rounded-2xl bg-[#FAFAF8] p-4 text-xs leading-5 text-[#77716D]">
      Koneksi ini tidak dibuat otomatis. Pilih <strong class="font-semibold text-[#1F1F1F]">Terima</strong> hanya kalau kamu memang mengenali undangan ini dan ingin berbagi ruang UANG KITA tersebut.
    </div>

    {#if flash?.error}
      <div class="mt-4 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] px-4 py-3 text-xs leading-5 text-[#9E3A33]">{flash.error}</div>
    {/if}

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <button type="button" onclick={acceptInvite} disabled={Boolean(action)} class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-55">
        {#if action === 'accept'}<LoaderCircle class="animate-spin" size={17} />{:else}<Check size={17} />{/if}
        Terima undangan
      </button>
      <button type="button" onclick={rejectInvite} disabled={Boolean(action)} class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DED9D4] bg-white px-5 py-3.5 text-sm font-semibold text-[#3F3B38] transition hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-55">
        {#if action === 'reject'}<LoaderCircle class="animate-spin" size={17} />{:else}<X size={17} />{/if}
        Tolak
      </button>
    </div>
  </section>
</AuthShell>
