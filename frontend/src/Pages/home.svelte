<script>
    import { page } from "@inertiajs/svelte";
    import {
        ArrowRight,
        CircleDollarSign,
        HeartHandshake,
        Landmark,
        MessageCircleMore,
        ShieldCheck,
        WalletCards,
    } from "lucide-svelte";
    import AppShell from "../Components/UangKita/AppShell.svelte";

    let user = page.props.user;
    const firstName = user?.name?.split(" ")?.[0] || "kalian";
</script>

<svelte:head>
    <title>UANG KITA · Sedalam Ini.</title>
    <meta
        name="description"
        content="Ruang pasangan untuk melihat kondisi uang bersama, mengetahui batas aman, dan membuat keputusan dengan lebih jernih."
    />
</svelte:head>

<AppShell active="home">
    <section class="mb-7 sm:mb-9">
        <p class="text-xs font-medium text-[#8E837B]">Halo, {firstName}.</p>
        <div class="mt-2 max-w-2xl">
            <h1 class="text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#25211F] sm:text-4xl">
                Uang kalian belum harus sempurna. Yang penting, mulai terlihat jelas.
            </h1>
            <p class="mt-3 max-w-xl text-sm leading-6 text-[#756D66] sm:text-[15px]">
                UANG KITA membantu kalian melihat apa yang sudah punya tujuan, apa yang masih fleksibel,
                dan keputusan apa yang sebaiknya dibicarakan berdua.
            </p>
        </div>
    </section>

    <section class="overflow-hidden rounded-[28px] border border-[#E5D9CF] bg-[#FFFDFC] shadow-[0_16px_50px_rgba(76,55,43,0.06)]">
        <div class="p-5 sm:p-7">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <div class="inline-flex items-center gap-2 rounded-full bg-[#F2E7DF] px-3 py-1.5 text-[11px] font-semibold text-[#7B4038]">
                        <CircleDollarSign size={14} strokeWidth={2} />
                        Angka Aman
                    </div>
                    <h2 class="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#2B2724] sm:text-2xl">
                        Belum dihitung
                    </h2>
                    <p class="mt-2 max-w-md text-sm leading-6 text-[#7C736C]">
                        Setelah kalian menyusun kondisi bulan ini, di sini akan muncul berapa uang yang
                        benar-benar aman digunakan tanpa mengganggu kebutuhan yang sudah disepakati.
                    </p>
                </div>

                <div class="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4EEE8] text-[#8F655D] sm:flex">
                    <ShieldCheck size={22} strokeWidth={1.7} />
                </div>
            </div>

            <div class="mt-6 rounded-2xl border border-dashed border-[#DCCFC4] bg-[#FAF7F3] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
                <div>
                    <p class="text-sm font-semibold text-[#3A3430]">
                        Mulai dari satu bulan, bukan seluruh hidup finansial kalian.
                    </p>
                    <p class="mt-1 text-xs leading-5 text-[#8A8078]">
                        Isi pemasukan, kewajiban, target bersama, dan ruang personal. Tidak perlu menghubungkan rekening bank.
                    </p>
                </div>

                <button
                    type="button"
                    class="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-[#7B4038] px-4 py-3 text-sm font-semibold text-white opacity-55 sm:mt-0 sm:w-auto"
                    disabled
                    title="Onboarding akan diaktifkan pada fase berikutnya"
                >
                    Susun bulan ini
                    <ArrowRight size={17} />
                </button>
            </div>
        </div>
    </section>

    <section class="mt-5 grid gap-3 sm:grid-cols-3">
        <article class="rounded-[22px] border border-[#E8DED6] bg-[#FBF8F4] p-5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                <Landmark size={18} strokeWidth={1.8} />
            </div>
            <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Kita</p>
            <p class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#37312D]">Belum diatur</p>
            <p class="mt-1 text-xs leading-5 text-[#948980]">
                Kebutuhan dan tujuan yang kalian tanggung bersama.
            </p>
        </article>

        <article class="rounded-[22px] border border-[#E8DED6] bg-[#FBF8F4] p-5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                <WalletCards size={18} strokeWidth={1.8} />
            </div>
            <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Kamu</p>
            <p class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#37312D]">Belum diatur</p>
            <p class="mt-1 text-xs leading-5 text-[#948980]">
                Ruang personal yang tidak harus dinegosiasikan setiap kali dipakai.
            </p>
        </article>

        <article class="rounded-[22px] border border-[#E8DED6] bg-[#FBF8F4] p-5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                <HeartHandshake size={18} strokeWidth={1.8} />
            </div>
            <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Pasangan</p>
            <p class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#37312D]">Belum diatur</p>
            <p class="mt-1 text-xs leading-5 text-[#948980]">
                Ruang personal pasangan dengan batas yang disepakati bersama.
            </p>
        </article>
    </section>

    <section class="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article class="rounded-[26px] border border-[#E4DAD1] bg-white p-5 sm:p-6">
            <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
                    <MessageCircleMore size={19} strokeWidth={1.8} />
                </div>
                <div>
                    <h2 class="text-base font-semibold tracking-[-0.02em] text-[#312C29]">
                        Yang perlu kalian lakukan
                    </h2>
                    <p class="mt-0.5 text-xs text-[#90867E]">Cukup tiga keputusan untuk memulai.</p>
                </div>
            </div>

            <ol class="mt-5 space-y-4">
                <li class="flex gap-3">
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0E5DD] text-xs font-semibold text-[#7B4038]">1</span>
                    <div>
                        <p class="text-sm font-semibold text-[#403934]">Lihat kondisi bulan ini</p>
                        <p class="mt-1 text-xs leading-5 text-[#8B8179]">
                            Masukkan uang yang masuk dan yang sudah punya kewajiban.
                        </p>
                    </div>
                </li>
                <li class="flex gap-3">
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0E5DD] text-xs font-semibold text-[#7B4038]">2</span>
                    <div>
                        <p class="text-sm font-semibold text-[#403934]">Tentukan ruang yang aman</p>
                        <p class="mt-1 text-xs leading-5 text-[#8B8179]">
                            Pisahkan kebutuhan bersama, uang personal, dan buffer.
                        </p>
                    </div>
                </li>
                <li class="flex gap-3">
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0E5DD] text-xs font-semibold text-[#7B4038]">3</span>
                    <div>
                        <p class="text-sm font-semibold text-[#403934]">Sepakati kapan perlu ngobrol</p>
                        <p class="mt-1 text-xs leading-5 text-[#8B8179]">
                            Tidak semua pengeluaran harus minta izin, tapi batasnya perlu jelas.
                        </p>
                    </div>
                </li>
            </ol>
        </article>

        <aside class="rounded-[26px] bg-[#342E2A] p-5 text-[#F8F3EE] sm:p-6">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#CDB8AB]">Prinsip UANG KITA</p>
            <p class="mt-4 text-xl font-medium leading-7 tracking-[-0.025em]">
                Bukan alat untuk mengontrol pasangan.
            </p>
            <p class="mt-3 text-sm leading-6 text-[#D8CEC7]">
                Semua batas dibuat bersama. Tujuannya bukan mencari siapa yang salah, tetapi membuat keputusan uang
                lebih terlihat dan lebih mudah dibicarakan.
            </p>
        </aside>
    </section>
</AppShell>
