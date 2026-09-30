<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-svelte'
  import AuthShell from '../../Components/UangKita/AuthShell.svelte'

  let form = $state({ email: '', password: '' })
  let isLoading = $state(false)
  let showPassword = $state(false)
  let { flash } = $props()
  let serverError = $state('')

  function submitForm() {
    serverError = ''
    isLoading = true
    router.post('/login', { email: form.email, password: form.password }, {
      onFinish: () => {
        setTimeout(() => { isLoading = false }, 350)
      },
      onError: (errors) => {
        setTimeout(() => {
          isLoading = false
          if (errors.email) serverError = errors.email
          else if (errors.password) serverError = errors.password
          else serverError = 'Ada yang belum pas. Cek kembali email dan kata sandi kamu.'
        }, 350)
      }
    })
  }
</script>

<svelte:head>
  <title>Masuk · UANG KITA</title>
  <meta name="description" content="Masuk ke UANG KITA, ruang pasangan untuk melihat kondisi uang bersama dan membuat keputusan dengan lebih jernih." />
</svelte:head>

<AuthShell>
  <div class="rounded-[24px] border border-[#EEEAE6] bg-white p-5 shadow-[0_16px_50px_rgba(31,31,31,0.05)] sm:rounded-[28px] sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
    <div>
      <p class="text-xs font-semibold text-[#E1463D]">Selamat datang kembali</p>
      <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Masuk ke ruang kalian.</h1>
      <p class="mt-3 max-w-md text-sm leading-6 text-[#68635F]">Lanjutkan melihat kondisi bulan ini dan keputusan yang perlu kalian bicarakan bersama.</p>
    </div>

    {#if flash?.error || serverError}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} />
        <p class="text-sm leading-5">{serverError || flash?.error}</p>
      </div>
    {/if}

    <form class="mt-6 space-y-5" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <label for="email" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
          <input bind:value={form.email} required type="email" name="email" id="email" autocomplete="email" placeholder="nama@email.com" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between gap-3">
          <label for="password" class="block text-sm font-semibold text-[#3F3B38]">Kata sandi</label>
          <a href="/forgot-password" use:inertia class="text-xs font-semibold text-[#E1463D] transition hover:text-[#C9362E]">Lupa kata sandi?</a>
        </div>
        <div class="relative">
          <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
          <input bind:value={form.password} required type={showPassword ? 'text' : 'password'} name="password" id="password" autocomplete="current-password" placeholder="Masukkan kata sandi" class="uk-input py-3.5 pl-12 pr-12 text-[15px] placeholder:text-[#A39D98]" />
          <button type="button" onclick={() => showPassword = !showPassword} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8C8782] transition hover:text-[#1F1F1F]">
            {#if showPassword}<EyeOff size={18} />{:else}<Eye size={18} />{/if}
          </button>
        </div>
      </div>

      <button type="submit" disabled={isLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(225,70,61,0.16)] transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-60">
        {#if isLoading}<LoaderCircle class="animate-spin" size={18} /> Sedang masuk...{:else}Masuk <ArrowRight size={17} />{/if}
      </button>
    </form>

    <div class="mt-7 border-t border-[#F0ECE8] pt-6 text-center">
      <p class="text-sm text-[#77716D]">Belum punya akun? <a href="/register" use:inertia class="ml-1 font-semibold text-[#E1463D] transition hover:text-[#C9362E]">Buat akun</a></p>
    </div>

    <p class="mt-5 text-center text-[11px] leading-5 text-[#8C8782] lg:text-left">Data yang kamu isi digunakan untuk membantu perhitungan dan kesepakatan di UANG KITA.</p>
  </div>
</AuthShell>
