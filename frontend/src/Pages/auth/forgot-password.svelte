<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, LoaderCircle, Mail } from 'lucide-svelte'
  import AuthShell from '../../Components/UangKita/AuthShell.svelte'

  let form = $state({ email: '', phone: '' })
  let isLoading = $state(false)
  let { flash } = $props()

  function submitForm() {
    isLoading = true
    router.post('/forgot-password', form, {
      onFinish: () => { isLoading = false }
    })
  }
</script>

<svelte:head>
  <title>Lupa kata sandi · UANG KITA</title>
  <meta name="description" content="Minta tautan reset kata sandi untuk kembali masuk ke UANG KITA." />
</svelte:head>

<AuthShell>
  <div class="rounded-[24px] border border-[#EEEAE6] bg-white p-5 shadow-[0_16px_50px_rgba(31,31,31,0.05)] sm:rounded-[28px] sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
    <a href="/login" use:inertia class="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#E1463D] transition hover:text-[#C9362E]"><ArrowLeft size={15} /> Kembali ke masuk</a>

    <div>
      <p class="text-xs font-semibold text-[#E1463D]">Akses akun</p>
      <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Lupa kata sandi?</h1>
      <p class="mt-3 max-w-md text-sm leading-6 text-[#68635F]">Masukkan email akunmu. Kami akan kirim langkah untuk membuat kata sandi baru.</p>
    </div>

    {#if flash?.error}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]"><CircleAlert class="mt-0.5 shrink-0" size={18} /><p class="text-sm leading-5">{flash.error}</p></div>
    {/if}

    {#if flash?.success}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#DDE8D9] bg-[#F4F8F2] p-4 text-[#486043]"><CircleCheck class="mt-0.5 shrink-0" size={18} /><p class="text-sm leading-5">{flash.success}</p></div>
    {/if}

    <form class="mt-6 space-y-4" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <label for="email" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
          <input bind:value={form.email} type="email" name="email" id="email" autocomplete="email" placeholder="nama@email.com" required class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
        </div>
      </div>

      <button type="submit" disabled={isLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-60">
        {#if isLoading}<LoaderCircle class="animate-spin" size={18} /> Mengirim...{:else}Kirim tautan reset <ArrowRight size={17} />{/if}
      </button>
    </form>

    <p class="mt-5 text-center text-[11px] leading-5 text-[#8C8782]">Kalau email terdaftar, instruksi reset akan dikirim ke alamat tersebut.</p>
  </div>
</AuthShell>
