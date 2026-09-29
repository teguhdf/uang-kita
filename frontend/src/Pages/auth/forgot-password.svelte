<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, LoaderCircle, Mail } from 'lucide-svelte'
  import AuthShell from '../../Components/UangKita/AuthShell.svelte'

  let form = $state({
    email: '',
    phone: ''
  })

  let isLoading = $state(false)
  let { flash } = $props()

  function submitForm() {
    isLoading = true
    router.post('/forgot-password', form, {
      onFinish: () => {
        isLoading = false
      }
    })
  }
</script>

<svelte:head>
  <title>Lupa kata sandi · UANG KITA</title>
  <meta name="description" content="Minta tautan reset kata sandi untuk kembali masuk ke UANG KITA." />
</svelte:head>

<AuthShell>
  <div class="rounded-[28px] border border-[#E4DAD1] bg-[#FFFDFC] p-5 shadow-[0_18px_60px_rgba(72,51,39,0.07)] sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
    <a href="/login" use:inertia class="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#8B5148] transition-colors hover:text-[#693A34]">
      <ArrowLeft size={15} />
      Kembali ke masuk
    </a>

    <div>
      <p class="text-xs font-medium text-[#9A665D]">Akses akun</p>
      <h1 class="mt-2 text-[29px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#292421] sm:text-4xl">
        Lupa kata sandi?
      </h1>
      <p class="mt-3 max-w-md text-sm leading-6 text-[#766D66]">
        Masukkan email akunmu. Kami akan kirim langkah untuk membuat kata sandi baru.
      </p>
    </div>

    {#if flash?.error}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#E9C9C4] bg-[#FFF4F2] p-4 text-[#84463E]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{flash.error}</p>
      </div>
    {/if}

    {#if flash?.success}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#CFE1D4] bg-[#F4FAF5] p-4 text-[#416A4C]">
        <CircleCheck class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{flash.success}</p>
      </div>
    {/if}

    <form class="mt-6 space-y-4" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <label for="email" class="mb-2 block text-sm font-medium text-[#4A433E]">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9188]" size={18} strokeWidth={1.7} />
          <input bind:value={form.email} type="email" name="email" id="email" autocomplete="email" placeholder="nama@email.com" required class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9F958D] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
        </div>
      </div>

      <button type="submit" disabled={isLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7B4038] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(123,64,56,0.16)] transition hover:bg-[#69362F] focus:outline-none focus:ring-4 focus:ring-[#7B4038]/15 disabled:cursor-not-allowed disabled:opacity-60">
        {#if isLoading}
          <LoaderCircle class="animate-spin" size={18} />
          Mengirim...
        {:else}
          Kirim tautan reset
          <ArrowRight size={17} />
        {/if}
      </button>
    </form>

    <p class="mt-5 text-center text-[11px] leading-5 text-[#938980]">
      Kalau email terdaftar, instruksi reset akan dikirim ke alamat tersebut.
    </p>
  </div>
</AuthShell>
