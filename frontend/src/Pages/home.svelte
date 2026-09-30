<script>
    import { page, inertia } from "@inertiajs/svelte";
    import {
        ArrowRight,
        CalendarDays,
        CircleCheck,
        CircleDollarSign,
        Layers3,
        Leaf,
        MessageCircle,
        PencilLine,
        UsersRound,
        WalletCards,
    } from "lucide-svelte";
    import AppShell from "../Components/UangKita/AppShell.svelte";

    let { overview, flash } = $props();
    let user = page.props.user;
    const firstName = user?.name?.split(" ")?.[0] || "kalian";

    function rupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    }

    function formatDate(value) {
        if (!value) return "-";
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(`${value}T00:00:00`));
    }

    function percent(value, total) {
        const base = Number(total || 0);
        if (base <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((Number(value || 0) / base) * 100)));
    }
</script>

<svelte:head>
    <title>UANG KITA · Sedalam Ini.</title>
    <meta name="description" content="Lihat kondisi uang bersama, Angka Aman, dan keputusan yang perlu dibicarakan berdua." />
</svelte:head>

<AppShell active="home">
    <section class="mb-4 px-1 py-1 sm:mb-6 sm:rounded-[26px] sm:border sm:border-[#F0ECE8] sm:bg-[#FAFAF8] sm:px-7 sm:py-7">
        <div class="max-w-2xl">
            <p class="text-[11px] font-semibold text-[#E1463D] sm:text-xs">Assalamu’alaikum, {firstName}.</p>
            <h1 class="mt-1.5 text-[24px] font-semibold leading-[1.08] tracking-[-0.042em] text-[#1F1F1F] sm:mt-2 sm:text-[38px]">
                Tenang mengelola uang,<br class="hidden sm:block" /> lebih dekat dalam tujuan hidup.
            </h1>
            <p class="mt-3 hidden max-w-xl text-[15px] leading-6 text-[#65605C] sm:block">
                UANG KITA membantu kalian melihat kondisi bulan ini dengan lebih jelas, lalu mengambil keputusan sesuai kesepakatan bersama.
            </p>
        </div>
    </section>

    {#if flash?.success}
        <div class="mb-4 flex items-start gap-3 rounded-2xl border border-[#DDE8D9] bg-[#F4F8F2] p-3.5 text-[#486043] sm:mb-5 sm:p-4">
            <CircleCheck class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
            <p class="text-sm leading-5">{flash.success}</p>
        </div>
    {/if}

    {#if !overview || !overview.plan || !overview.metrics}
        <section class="uk-card p-5 sm:p-7">
            <div class="max-w-xl">
                <div class="inline-flex items-center gap-2 rounded-full bg-[#FFF1EF] px-3 py-1.5 text-xs font-semibold text-[#C9362E]">
                    <CircleDollarSign size={15} /> Angka Aman
                </div>
                <h2 class="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[#1F1F1F]">Belum dihitung.</h2>
                <p class="mt-2 text-sm leading-6 text-[#6E6965]">
                    Susun kondisi bulan ini sekali. Setelah itu kalian bisa melihat uang tersedia, alokasi, sisa fleksibel, dan batas aman hingga pemasukan berikutnya.
                </p>
                <a href="/onboarding" use:inertia class="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C9362E]">
                    Susun bulan ini <ArrowRight size={17} />
                </a>
            </div>
        </section>
    {:else}
        {@const plan = overview.plan}
        {@const metrics = overview.metrics}
        {@const allocatedPct = percent(metrics.totalAllocated, plan.available_money)}
        {@const flexiblePct = percent(metrics.flexibleAmount, plan.available_money)}

        <section class="grid gap-3 lg:grid-cols-[1.05fr_1.95fr] lg:gap-4">
            <article class="rounded-[24px] bg-[#1F1F1F] p-4 text-white shadow-[0_16px_48px_rgba(31,31,31,0.12)] sm:rounded-[26px] sm:p-6">
                <div class="flex items-center justify-between gap-3">
                    <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                        <CircleDollarSign size={15} /> Angka Aman
                    </div>
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#DDD8D4]">Mingguan</span>
                </div>

                {#if metrics.deficitAmount > 0}
                    <p class="mt-4 text-xs font-medium text-[#F3B2AC] sm:mt-6">Alokasi melebihi uang tersedia</p>
                    <p class="mt-1 text-[32px] font-semibold tracking-[-0.045em] sm:text-[40px]">-{rupiah(metrics.deficitAmount)}</p>
                    <p class="mt-2 text-[13px] leading-5 text-[#D7D2CE] sm:mt-3 sm:text-sm sm:leading-6">Atur ulang rencana sebelum memakai angka ini untuk keputusan.</p>
                {:else}
                    <p class="mt-4 text-[32px] font-semibold tracking-[-0.045em] sm:mt-6 sm:text-[40px]">{rupiah(metrics.safeWeekly)}</p>
                    <p class="mt-1.5 text-[13px] leading-5 text-[#D8D4D1] sm:mt-2 sm:text-sm sm:leading-6">
                        Sekitar <strong class="font-semibold text-white">{rupiah(metrics.safeDaily)}</strong> per hari selama {metrics.daysRemaining} hari menuju pemasukan berikutnya.
                    </p>
                {/if}

                <a href="/onboarding" use:inertia class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/90 transition hover:text-white sm:mt-6">
                    <PencilLine size={15} /> Atur rencana
                </a>
            </article>

            <div class="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
                <article class="uk-card flex items-center gap-3 p-4 sm:block sm:p-5">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEF7F0] text-[#4D8B5B]"><WalletCards size={19} /></div>
                    <div class="min-w-0 flex-1">
                        <p class="text-[11px] font-semibold text-[#6D6964] sm:mt-5 sm:text-xs">Uang Tersedia</p>
                        <p class="mt-0.5 text-lg font-semibold tracking-[-0.03em] text-[#1F1F1F] sm:mt-1 sm:text-xl">{rupiah(plan.available_money)}</p>
                        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF0EC] sm:mt-4"><div class="h-full w-full rounded-full bg-[#69B97B]"></div></div>
                        <p class="mt-1.5 hidden text-[11px] text-[#8A8580] sm:block">Dana yang siap digunakan sekarang.</p>
                    </div>
                </article>

                <article class="uk-card flex items-center gap-3 p-4 sm:block sm:p-5">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0EF] text-[#E1463D]"><Layers3 size={19} /></div>
                    <div class="min-w-0 flex-1">
                        <p class="text-[11px] font-semibold text-[#6D6964] sm:mt-5 sm:text-xs">Sudah Dialokasikan</p>
                        <p class="mt-0.5 text-lg font-semibold tracking-[-0.03em] text-[#1F1F1F] sm:mt-1 sm:text-xl">{rupiah(metrics.totalAllocated)}</p>
                        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F3EFED] sm:mt-4"><div class="h-full rounded-full bg-[#E1463D]" style={`width:${allocatedPct}%`}></div></div>
                        <p class="mt-1.5 hidden text-[11px] text-[#8A8580] sm:block">{allocatedPct}% dari uang tersedia.</p>
                    </div>
                </article>

                <article class="uk-card flex items-center gap-3 p-4 sm:block sm:p-5">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7EA] text-[#C88B2A]"><Leaf size={19} /></div>
                    <div class="min-w-0 flex-1">
                        <p class="text-[11px] font-semibold text-[#6D6964] sm:mt-5 sm:text-xs">Masih Fleksibel</p>
                        <p class="mt-0.5 text-lg font-semibold tracking-[-0.03em] text-[#1F1F1F] sm:mt-1 sm:text-xl">{rupiah(metrics.flexibleAmount)}</p>
                        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4F0E8] sm:mt-4"><div class="h-full rounded-full bg-[#E9B657]" style={`width:${flexiblePct}%`}></div></div>
                        <p class="mt-1.5 hidden text-[11px] text-[#8A8580] sm:block">{flexiblePct}% masih punya ruang.</p>
                    </div>
                </article>
            </div>
        </section>

        <section class="mt-6 sm:mt-7">
            <div class="mb-3">
                <h2 class="text-lg font-semibold tracking-[-0.025em] text-[#1F1F1F]">Menu utama</h2>
                <p class="mt-1 hidden text-sm text-[#77716D] sm:block">Pilih hal yang ingin kalian kelola.</p>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
                <a href="/onboarding" use:inertia class="group uk-card flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:border-[#E3DDD8] hover:shadow-[0_14px_40px_rgba(31,31,31,0.07)] sm:p-5">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><CalendarDays size={20} /></span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-base font-semibold text-[#1F1F1F]">Rencana</span>
                        <span class="mt-1 block text-xs leading-5 text-[#77716D]">Atur pemasukan, pengeluaran, dan alokasi bulan ini.</span>
                    </span>
                    <ArrowRight class="mt-1 text-[#A39D98] transition group-hover:translate-x-0.5 group-hover:text-[#E1463D]" size={17} />
                </a>

                <a href="/aman-kalau-dibeli" use:inertia class="group uk-card flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:border-[#E3DDD8] hover:shadow-[0_14px_40px_rgba(31,31,31,0.07)] sm:p-5">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><MessageCircle size={20} /></span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-base font-semibold text-[#1F1F1F]">Keputusan</span>
                        <span class="mt-1 block text-xs leading-5 text-[#77716D]">Cek aman atau tidak kalau mau beli sesuatu.</span>
                    </span>
                    <ArrowRight class="mt-1 text-[#A39D98] transition group-hover:translate-x-0.5 group-hover:text-[#E1463D]" size={17} />
                </a>

                <a href="/aturan-keputusan" use:inertia class="group uk-card flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:border-[#E3DDD8] hover:shadow-[0_14px_40px_rgba(31,31,31,0.07)] sm:p-5">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><UsersRound size={20} /></span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-base font-semibold text-[#1F1F1F]">Kita</span>
                        <span class="mt-1 block text-xs leading-5 text-[#77716D]">Atur kesepakatan dan hubungkan akun pasangan.</span>
                    </span>
                    <ArrowRight class="mt-1 text-[#A39D98] transition group-hover:translate-x-0.5 group-hover:text-[#E1463D]" size={17} />
                </a>
            </div>
        </section>

        <section class="mt-7 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article class="uk-card p-5 sm:p-6">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-xs font-semibold text-[#E1463D]">Rencana bulan ini</p>
                        <h3 class="mt-1 text-base font-semibold text-[#1F1F1F]">Yang sudah punya tujuan</h3>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-[#77716D]"><CalendarDays size={15} /> {formatDate(plan.next_income_date)}</div>
                </div>
                <div class="mt-5 divide-y divide-[#F0ECE8] text-sm">
                    <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Kebutuhan & tagihan wajib</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(plan.fixed_commitments)}</strong></div>
                    <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Cicilan / utang</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(plan.debt_payments)}</strong></div>
                    <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Target tabungan bersama</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(plan.savings_target)}</strong></div>
                    <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Safety buffer</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(plan.safety_buffer)}</strong></div>
                </div>
            </article>

            <article class="uk-card p-5 sm:p-6">
                <p class="text-xs font-semibold text-[#E1463D]">Ruang personal</p>
                <h3 class="mt-1 text-base font-semibold text-[#1F1F1F]">Tetap punya ruang masing-masing.</h3>
                <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div class="rounded-2xl bg-[#FAFAF8] p-4">
                        <p class="text-xs text-[#77716D]">Uang Kamu</p>
                        <p class="mt-1 text-lg font-semibold text-[#1F1F1F]">{rupiah(plan.personal_owner)}</p>
                    </div>
                    <div class="rounded-2xl bg-[#FAFAF8] p-4">
                        <p class="text-xs text-[#77716D]">Uang {overview.partnerName}</p>
                        <p class="mt-1 text-lg font-semibold text-[#1F1F1F]">{rupiah(plan.personal_partner)}</p>
                    </div>
                </div>
            </article>
        </section>
    {/if}
</AppShell>
