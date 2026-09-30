<script>
  import { inertia, router } from '@inertiajs/svelte'
  import {
    ArrowLeft,
    ArrowRight,
    CircleAlert,
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail,
    Phone,
    UserRound
  } from 'lucide-svelte'
  import AuthShell from '../../Components/UangKita/AuthShell.svelte'

  let form = $state({
    email: '',
    password: '',
    name: '',
    phone: '',
    password_confirmation: ''
  })

  let { flash } = $props()
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
    form.phone = form.phone.toString()

    router.post('/register', form, {
      onFinish: () => {
        setTimeout(() => { isLoading = false }, 350)
      },
      onError: (errors) => {
        setTimeout(() => {
          isLoading = false
          if (errors.email) serverError = errors.email
          else if (errors.password) serverError = errors.password
          else if (errors.name) serverError = errors.name
          else if (errors.phone) serverError = errors.phone
          else serverError = 'Ada yang belum pas. Cek kembali data yang kamu isi.'
        }, 350)
      }
    })
  }
</script>

<svelte:head>
  <title>Buat akun · UANG KITA</title>
  <meta name="description" content="Buat akun UANG KITA dan mulai menyusun ruang uang bersama pasangan." />
</svelte:head>

<AuthShell>
  <div class="rounded-[24px] border border-[#EEEAE6] bg-white p-5 shadow-[0_16px_50px_rgba(31,31,31,0.05)] sm:rounded-[28px] sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
    <a href="/login" use:inertia class="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#E1463D] transition hover:text-[#C9362E]">
      <ArrowLeft size={15} /> Kembali ke masuk
    </a>

    <div>
      <p class="text-xs font-semibold text-[#E1463D]">Mulai dari sini</p>
      <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Buat ruang kalian.</h1>
      <p class="mt-3 max-w-md text-sm leading-6 text-[#68635F]">Akun ini jadi pintu masuk untuk menyusun kondisi uang, batas aman, dan kesepakatan kalian.</p>
    </div>

    {#if flash?.error || serverError}
      <div class="mt-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
        <CircleAlert class="mt-0.5 shrink-0" size={18} />
        <p class="text-sm leading-5">{serverError || flash?.error}</p>
      </div>
    {/if}

    <form class="mt-6 space-y-4" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <label for="name" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Nama</label>
        <div class="relative">
          <UserRound class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
          <input bind:value={form.name} required type="text" name="name" id="name" autocomplete="name" placeholder="Nama lengkap" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="email" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Email</label>
          <div class="relative">
            <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
            <input bind:value={form.email} required type="email" name="email" id="email" autocomplete="email" placeholder="nama@email.com" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
          </div>
        </div>
        <div>
          <label for="phone" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Nomor HP</label>
          <div class="relative">
            <Phone class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
            <input bind:value={form.phone} required type="tel" name="phone" id="phone" autocomplete="tel" placeholder="08xxxxxxxxxx" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
          </div>
        </div>
      </div>

      <div>
        <label for="password" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Kata sandi</label>
        <div class="relative">
          <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
          <input bind:value={form.password} required type={showPassword ? 'text' : 'password'} name="password" id="password" autocomplete="new-password" placeholder="Buat kata sandi" class="uk-input py-3.5 pl-12 pr-12 text-[15px] placeholder:text-[#A39D98]" />
          <button type="button" onclick={() => showPassword = !showPassword} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8C8782] transition hover:text-[#1F1F1F]">
            {#if showPassword}<EyeOff size={18} />{:else}<Eye size={18} />{/if}
          </button>
        </div>
      </div>

      <div>
        <label for="password_confirmation" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Ulangi kata sandi</label>
        <div class="relative">
          <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
          <input bind:value={form.password_confirmation} required type={showPassword ? 'text' : 'password'} name="password_confirmation" id="password_confirmation" autocomplete="new-password" placeholder="Ulangi kata sandi" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
        </div>
        {#if passwordError}<p class="mt-2 text-xs font-semibold text-[#B24139]">{passwordError}</p>{/if}
      </div>

      <button type="submit" disabled={isLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(225,70,61,0.16)] transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-60">
        {#if isLoading}<LoaderCircle class="animate-spin" size={18} /> Membuat akun...{:else}Buat akun <ArrowRight size={17} />{/if}
      </button>
    </form>

    <p class="mt-5 text-center text-[11px] leading-5 text-[#8C8782]">Dengan membuat akun, kamu menyiapkan ruang privat untuk data dan kesepakatan UANG KITA.</p>
  </div>
</AuthShell>
