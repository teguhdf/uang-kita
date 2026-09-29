<script>
  import { HeartHandshake, ShieldCheck, WalletCards } from 'lucide-svelte'
</script>

<section class="min-h-[100dvh] bg-white text-[#1F1F1F] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
  <aside class="relative hidden overflow-hidden border-r border-[#EEEAE6] bg-[#FAFAF8] lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16">
    <div class="relative z-10">
      <img src="/public/sedalam-ini-logo.svg" alt="Sedalam Ini. UANG KITA" class="h-auto w-[190px]" />
    </div>

    <div class="relative z-10 max-w-xl py-12">
      <p class="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E1463D]">Uang yang lebih jelas. Hubungan yang lebih tenang.</p>
      <h2 class="mt-4 text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#1F1F1F] xl:text-[58px]">
        Biar keputusan soal uang nggak selalu dimulai dari tebakan.
      </h2>
      <p class="mt-6 max-w-lg text-base leading-7 text-[#68635F]">
        Lihat kondisi uang bersama, tahu batas yang aman, lalu sepakati mana yang bebas diputuskan dan mana yang perlu dibicarakan dulu.
      </p>

      <div class="mt-10 grid gap-3 sm:grid-cols-3">
        <div class="rounded-[22px] border border-[#EDEAE6] bg-white p-4 shadow-[0_8px_30px_rgba(31,31,31,0.035)]">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF1EF] text-[#E1463D]">
            <WalletCards size={18} strokeWidth={1.8} />
          </div>
          <p class="mt-4 text-sm font-semibold text-[#1F1F1F]">Lihat kondisi</p>
          <p class="mt-1 text-xs leading-5 text-[#77716D]">Satu gambaran sederhana tentang uang kalian bulan ini.</p>
        </div>

        <div class="rounded-[22px] border border-[#EDEAE6] bg-white p-4 shadow-[0_8px_30px_rgba(31,31,31,0.035)]">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F5F0] text-[#6F806B]">
            <ShieldCheck size={18} strokeWidth={1.8} />
          </div>
          <p class="mt-4 text-sm font-semibold text-[#1F1F1F]">Tahu batas aman</p>
          <p class="mt-1 text-xs leading-5 text-[#77716D]">Bedakan saldo dengan uang yang memang masih fleksibel.</p>
        </div>

        <div class="rounded-[22px] border border-[#EDEAE6] bg-white p-4 shadow-[0_8px_30px_rgba(31,31,31,0.035)]">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F3EF] text-[#8A7768]">
            <HeartHandshake size={18} strokeWidth={1.8} />
          </div>
          <p class="mt-4 text-sm font-semibold text-[#1F1F1F]">Sepakati bersama</p>
          <p class="mt-1 text-xs leading-5 text-[#77716D]">Bukan kontrol. Batasnya dibuat dan dipakai berdua.</p>
        </div>
      </div>
    </div>

    <p class="relative z-10 max-w-md text-xs leading-5 text-[#837D78]">
      UANG KITA membantu percakapan dan keputusan. Bukan pengganti nasihat finansial profesional.
    </p>

    <div class="pointer-events-none absolute -bottom-44 -right-36 h-[430px] w-[430px] rounded-full border-[72px] border-[#EAE6E1]/65"></div>
    <div class="pointer-events-none absolute right-16 top-20 h-24 w-24 rounded-full bg-[#E1463D]/8 blur-2xl"></div>
  </aside>

  <main class="flex min-h-[100dvh] items-start justify-center bg-white px-3 py-5 sm:items-center sm:px-6 sm:py-8 lg:px-10 xl:px-16">
    <div class="w-full max-w-[460px]">
      <div class="mb-5 px-1 sm:mb-8 lg:hidden">
        <img src="/public/sedalam-ini-logo.svg" alt="Sedalam Ini. UANG KITA" class="h-auto w-[150px]" />
      </div>
      <slot />
    </div>
  </main>
</section>
