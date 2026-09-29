<script>
  import { inertia, router } from '@inertiajs/svelte'
  import {
    ArrowLeft,
    ArrowRight,
    CircleAlert,
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole
  } from 'lucide-svelte'
  import AuthShell from '../../Components/UangKita/AuthShell.svelte'

  let { id, flash } = $props()

  let form = $state({
    password: '',
    password_confirmation: '',
    id
  })

  let isLoading = $state(false)
  let showPassword = $state(false)
  let passwordError = $state('')
  let serverError = $state('')

  function submitForm() {
    if (form.password !== form.password_confirmation) {
      passwordError = 'Kata sandi belum sama.'
      return
    }

    passwordError = ''
    serverError = ''
    isLoading = true

    router.post('/reset-password', form, {
      onFinish: () => isLoading = false,
      onError: (errors) => {
        isLoading = false
        if (errors.password) {
          serverError = errors.password
        } else if (errors.password_confirmation) {
          serverError = errors.password_confirmation
        } else if (errors.id) {
          serverError = errors.id
        } else {
          serverError = 'Ada yang belum pas. Cek kembali kata sandi yang kamu buat.'
        }
      }
    })
  }
</script>

<svelte:head>
  <title>Kata sandi baru · UANG KITA</title>
  <meta name="description" content="Buat kata sandi baru untuk akun UANG KITA." />
</svelte:head>

<AuthShell>
  <div class="rounded-[28px] border border-[#E4DAD1] bg-[#FFFDFC] p-5 shadow-[0_18px_60px_rgba(72,51,39,0.07)] sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
    <a href="/login" use:inertia class="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#8B5148] transition-colors hover:text-[#693A34]">
      <ArrowLeft size={15} />
      Kembali ke masuk
    </a>

    <div>
      <p class="text-xs font-medium text-[#9A665D]">Amankan akun</p>
      <h1 class="mt-2 text-[29px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#292421] sm:text-4xl">
        Buat kata sandi baru.
      </h1>
      <p class="mt-3 max-w-md text-sm leading-6 text-[#766D66]">
        Gunakan kata sandi yang berbeda dan mudah kamu ingat, tapi tidak mudah ditebak orang lain.
      </p>
    </div>

    {#if flash?.error || serverError}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#E9C9C4] bg-[#FFF4F2] p-4 text-[#84463E]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{serverError || flash?.error}</p>
      </div>
    {/if}

    <form class="mt-6 space-y-4" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <label for="password" class="mb-2 block text-sm font-medium text-[#4A433E]">Kata sandi baru</label>
        <div class="relative">
          <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9188]" size={18} strokeWidth={1.7} />
          <input bind:value={form.password} type={showPassword ? 'text' : 'password'} name="password" id="password" autocomplete="new-password" placeholder="Masukkan kata sandi baru" class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-12 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9F958D] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" required />
          <button type="button" onclick={() => showPassword = !showPassword} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#988E86] transition-colors hover:text-[#5F5751]">
            {#if showPassword}<EyeOff size={18} strokeWidth={1.7} />{:else}<Eye size={18} strokeWidth={1.7} />{/if}
          </button>
        </div>
      </div>

      <div>
        <label for="password_confirmation" class="mb-2 block text-sm font-medium text-[#4A433E]">Ulangi kata sandi</label>
        <div class="relative">
          <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9188]" size={18} strokeWidth={1.7} />
          <input bind:value={form.password_confirmation} type={showPassword ? 'text' : 'password'} name="password_confirmation" id="password_confirmation" autocomplete="new-password" placeholder="Ulangi kata sandi baru" class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9F958D] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" required />
        </div>
        {#if passwordError}
          <p class="mt-2 text-xs font-medium text-[#9A4D45]">{passwordError}</p>
        {/if}
      </div>

      <button type="submit" disabled={isLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7B4038] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(123,64,56,0.16)] transition hover:bg-[#69362F] focus:outline-none focus:ring-4 focus:ring-[#7B4038]/15 disabled:cursor-not-allowed disabled:opacity-60">
        {#if isLoading}
          <LoaderCircle class="animate-spin" size={18} />
          Menyimpan...
        {:else}
          Simpan kata sandi
          <ArrowRight size={17} />
        {/if}
      </button>
    </form>
  </div>
</AuthShell>
