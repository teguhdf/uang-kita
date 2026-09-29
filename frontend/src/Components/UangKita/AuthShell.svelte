<script>
  import { HeartHandshake, ShieldCheck, WalletCards } from 'lucide-svelte'
</script>

<section class="min-h-[100dvh] bg-[#F7F3EE] text-[#26211E] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
  <aside class="relative hidden overflow-hidden border-r border-[#E6DDD5] bg-[#EEE4DC] lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16">
    <div class="relative z-10">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9A665D]">Sedalam Ini.</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2A2522]">UANG KITA</h1>
    </div>

    <div class="relative z-10 max-w-xl py-12">
      <p class="text-[13px] font-medium text-[#8B7067]">Ruang uang untuk dua orang</p>
      <h2 class="mt-4 text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#2B2522] xl:text-6xl">
        Biar keputusan soal uang nggak selalu dimulai dari tebakan.
      </h2>
      <p class="mt-6 max-w-lg text-base leading-7 text-[#726860]">
        Lihat kondisi uang bersama, tahu batas yang aman, lalu sepakati mana yang bebas diputuskan dan mana yang perlu dibicarakan dulu.
      </p>

      <div class="mt-10 grid gap-3 sm:grid-cols-3">
        <div class="rounded-[22px] border border-[#DDCFC4] bg-[#F8F3EF]/80 p-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9D9CF] text-[#7B4038]">
            <WalletCards size={18} strokeWidth={1.8} />
          </div>
          <p class="mt-4 text-sm font-semibold text-[#403934]">Lihat kondisi</p>
          <p class="mt-1 text-xs leading-5 text-[#81766E]">Satu gambaran sederhana tentang uang kalian bulan ini.</p>
        </div>

        <div class="rounded-[22px] border border-[#DDCFC4] bg-[#F8F3EF]/80 p-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9D9CF] text-[#7B4038]">
            <ShieldCheck size={18} strokeWidth={1.8} />
          </div>
          <p class="mt-4 text-sm font-semibold text-[#403934]">Tahu batas aman</p>
          <p class="mt-1 text-xs leading-5 text-[#81766E]">Bedakan saldo dengan uang yang memang masih fleksibel.</p>
        </div>

        <div class="rounded-[22px] border border-[#DDCFC4] bg-[#F8F3EF]/80 p-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9D9CF] text-[#7B4038]">
            <HeartHandshake size={18} strokeWidth={1.8} />
          </div>
          <p class="mt-4 text-sm font-semibold text-[#403934]">Sepakati bersama</p>
          <p class="mt-1 text-xs leading-5 text-[#81766E]">Bukan kontrol. Batasnya dibuat dan dipakai berdua.</p>
        </div>
      </div>
    </div>

    <p class="relative z-10 max-w-md text-xs leading-5 text-[#8A7E76]">
      UANG KITA membantu percakapan dan keputusan. Bukan pengganti nasihat finansial profesional.
    </p>

    <div class="pointer-events-none absolute -bottom-40 -right-36 h-[430px] w-[430px] rounded-full border-[70px] border-[#E3D2C7]/55"></div>
    <div class="pointer-events-none absolute right-24 top-24 h-28 w-28 rounded-full bg-[#DDBEB1]/30 blur-2xl"></div>
  </aside>

  <main class="flex min-h-[100dvh] items-start justify-center px-3 py-5 sm:items-center sm:px-6 sm:py-8 lg:px-10 xl:px-16">
    <div class="w-full max-w-[460px]">
      <div class="mb-5 px-1 sm:mb-8 lg:hidden">
        <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A665D]">Sedalam Ini.</p>
        <p class="mt-1 text-lg font-semibold tracking-[-0.035em]">UANG KITA</p>
      </div>

      <slot />
    </div>
  </main>
</section>
