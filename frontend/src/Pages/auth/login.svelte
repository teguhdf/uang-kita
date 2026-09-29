<script>
  import { inertia, router } from '@inertiajs/svelte'
  import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-svelte'
  import AuthShell from '../../Components/UangKita/AuthShell.svelte'

  let form = $state({
    email: '',
    password: ''
  })

  let isLoading = $state(false)
  let showPassword = $state(false)
  let { flash } = $props()
  let serverError = $state('')

  function submitForm() {
    serverError = ''
    isLoading = true

    router.post('/login', { email: form.email, password: form.password }, {
      onFinish: () => {
        setTimeout(() => {
          isLoading = false
        }, 350)
      },
      onError: (errors) => {
        setTimeout(() => {
          isLoading = false
          if (errors.email) {
            serverError = errors.email
          } else if (errors.password) {
            serverError = errors.password
          } else {
            serverError = 'Ada yang belum pas. Cek kembali email dan kata sandi kamu.'
          }
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
  <div class="rounded-[24px] border border-[#E4DAD1] bg-[#FFFDFC] p-4 shadow-[0_14px_44px_rgba(72,51,39,0.06)] sm:rounded-[28px] sm:p-7 sm:shadow-[0_18px_60px_rgba(72,51,39,0.07)] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
    <div>
      <p class="text-[11px] font-medium text-[#9A665D] sm:text-xs">Selamat datang kembali</p>
      <h1 class="mt-1.5 text-[28px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#292421] sm:mt-2 sm:text-4xl">
        Masuk ke ruang kalian.
      </h1>
      <p class="mt-2.5 max-w-md text-[13px] leading-5 text-[#766D66] sm:mt-3 sm:text-sm sm:leading-6">
        Lanjutkan melihat kondisi bulan ini dan keputusan yang perlu kalian bicarakan bersama.
      </p>
    </div>

    {#if flash?.error || serverError}
      <div class="mt-4 flex items-start gap-3 rounded-2xl border border-[#E9C9C4] bg-[#FFF4F2] p-3.5 text-[#84463E] sm:mt-6 sm:p-4">
        <CircleAlert class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
        <p class="text-sm leading-5">{serverError || flash?.error}</p>
      </div>
    {/if}

    <form class="mt-5 space-y-4 sm:mt-7 sm:space-y-5" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <label for="email" class="mb-1.5 block text-sm font-medium text-[#4A433E] sm:mb-2">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8F857D]" size={18} strokeWidth={1.7} />
          <input
            bind:value={form.email}
            required
            type="email"
            name="email"
            id="email"
            autocomplete="email"
            placeholder="nama@email.com"
            class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9E948B] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10 sm:py-3.5"
          />
        </div>
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between gap-3 sm:mb-2">
          <label for="password" class="block text-sm font-medium text-[#4A433E]">Kata sandi</label>
          <a href="/forgot-password" use:inertia class="text-xs font-medium text-[#8B5148] transition-colors hover:text-[#693A34]">
            Lupa kata sandi?
          </a>
        </div>

        <div class="relative">
          <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8F857D]" size={18} strokeWidth={1.7} />
          <input
            bind:value={form.password}
            required
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            autocomplete="current-password"
            placeholder="Masukkan kata sandi"
            class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3 pl-12 pr-12 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9E948B] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10 sm:py-3.5"
          />
          <button
            type="button"
            onclick={() => showPassword = !showPassword}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#988E86] transition-colors hover:text-[#5F5751]"
          >
            {#if showPassword}
              <EyeOff size={18} strokeWidth={1.7} />
            {:else}
              <Eye size={18} strokeWidth={1.7} />
            {/if}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7B4038] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(123,64,56,0.16)] transition hover:bg-[#69362F] focus:outline-none focus:ring-4 focus:ring-[#7B4038]/15 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5"
      >
        {#if isLoading}
          <LoaderCircle class="animate-spin" size={18} />
          Sedang masuk...
        {:else}
          Masuk
          <ArrowRight size={17} />
        {/if}
      </button>
    </form>

    <div class="mt-5 border-t border-[#EAE1DA] pt-4 text-center sm:mt-7 sm:pt-6">
      <p class="text-sm text-[#7E756E]">
        Belum punya akun?
        <a href="/register" use:inertia class="ml-1 font-semibold text-[#7B4038] transition-colors hover:text-[#5E302A]">
          Buat akun
        </a>
      </p>
    </div>

    <p class="mt-4 text-center text-[10px] leading-4 text-[#958A82] sm:mt-6 sm:text-[11px] sm:leading-5 lg:text-left">
      Data yang kamu isi digunakan untuk membantu perhitungan dan kesepakatan di UANG KITA.
    </p>
  </div>
</AuthShell>
