<script>
    import { page, inertia } from "@inertiajs/svelte";
    import {
        ArrowRight,
        CalendarDays,
        CircleAlert,
        CircleCheck,
        CircleDollarSign,
        HeartHandshake,
        Landmark,
        PencilLine,
        ShieldCheck,
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
                Lihat apa yang sudah punya tujuan, apa yang masih fleksibel, dan berapa yang aman digunakan sampai pemasukan berikutnya.
            </p>
        </div>
    </section>

    {#if flash?.success}
        <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#D8E2D4] bg-[#F4F8F1] p-4 text-[#53664E]">
            <CircleCheck class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
            <p class="text-sm leading-5">{flash.success}</p>
        </div>
    {/if}

    {#if !overview || !overview.plan || !overview.metrics}
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
                            Susun kondisi uang bulan ini sekali saja. Setelah itu UANG KITA akan menunjukkan berapa yang masih fleksibel dan batas aman sampai pemasukan berikutnya.
                        </p>
                    </div>

                    <div class="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4EEE8] text-[#8F655D] sm:flex">
                        <ShieldCheck size={22} strokeWidth={1.7} />
                    </div>
                </div>

                <div class="mt-6 rounded-2xl border border-dashed border-[#DCCFC4] bg-[#FAF7F3] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div>
                        <p class="text-sm font-semibold text-[#3A3430]">Mulai dari periode sekarang.</p>
                        <p class="mt-1 text-xs leading-5 text-[#8A8078]">Nggak perlu menghubungkan rekening atau mencatat setiap transaksi.</p>
                    </div>

                    <a href="/onboarding" use:inertia class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7B4038] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#69362F] sm:mt-0 sm:w-auto">
                        Susun bulan ini
                        <ArrowRight size={17} />
                    </a>
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
                <p class="mt-1 text-xs leading-5 text-[#948980]">Ruang fleksibel setelah kebutuhan, target, dan uang personal dipisahkan.</p>
            </article>

            <article class="rounded-[22px] border border-[#E8DED6] bg-[#FBF8F4] p-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                    <WalletCards size={18} strokeWidth={1.8} />
                </div>
                <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Kamu</p>
                <p class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#37312D]">Belum diatur</p>
                <p class="mt-1 text-xs leading-5 text-[#948980]">Ruang personal yang tidak perlu dinegosiasikan setiap kali dipakai.</p>
            </article>

            <article class="rounded-[22px] border border-[#E8DED6] bg-[#FBF8F4] p-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                    <HeartHandshake size={18} strokeWidth={1.8} />
                </div>
                <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Pasangan</p>
                <p class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#37312D]">Belum diatur</p>
                <p class="mt-1 text-xs leading-5 text-[#948980]">Ruang personal pasangan dengan nilai yang kalian sepakati.</p>
            </article>
        </section>
    {:else}
        {@const plan = overview.plan}
        {@const metrics = overview.metrics}

        <section class="overflow-hidden rounded-[28px] border border-[#E1D4C9] bg-[#342E2A] text-[#F8F3EE] shadow-[0_18px_60px_rgba(52,46,42,0.12)]">
            <div class="p-5 sm:p-7">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#E2C8BC]">
                            <CircleDollarSign size={14} strokeWidth={2} />
                            Angka Aman
                        </div>

                        {#if metrics.deficitAmount > 0}
                            <p class="mt-5 text-sm text-[#E7B7AE]">Alokasi bulan ini melewati uang yang tersedia.</p>
                            <h2 class="mt-1 text-[34px] font-semibold tracking-[-0.045em] text-white sm:text-[42px]">
                                -{rupiah(metrics.deficitAmount)}
                            </h2>
                            <p class="mt-3 max-w-lg text-sm leading-6 text-[#D8CEC7]">Kurangi salah satu alokasi di menu Rencana sebelum memakai angka ini untuk keputusan.</p>
                        {:else}
                            <p class="mt-5 text-xs text-[#CFC2BA]">Aman digunakan per minggu</p>
                            <h2 class="mt-1 text-[34px] font-semibold tracking-[-0.045em] text-white sm:text-[42px]">
                                {rupiah(metrics.safeWeekly)}
                            </h2>
                            <p class="mt-2 text-sm leading-6 text-[#D8CEC7]">Sekitar {rupiah(metrics.safeDaily)} per hari selama {metrics.daysRemaining} hari menuju pemasukan berikutnya.</p>
                        {/if}
                    </div>

                    <a href="/onboarding" use:inertia class="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-[#F7EFE9] transition hover:bg-white/10">
                        <PencilLine size={15} strokeWidth={1.8} />
                        Atur ulang
                    </a>
                </div>

                <div class="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
                    <div>
                        <p class="text-[10px] uppercase tracking-[0.15em] text-[#BFB2AA]">Uang tersedia</p>
                        <p class="mt-1 text-sm font-semibold text-white">{rupiah(plan.available_money)}</p>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase tracking-[0.15em] text-[#BFB2AA]">Sudah dialokasikan</p>
                        <p class="mt-1 text-sm font-semibold text-white">{rupiah(metrics.totalAllocated)}</p>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase tracking-[0.15em] text-[#BFB2AA]">Masih fleksibel</p>
                        <p class="mt-1 text-sm font-semibold text-white">{rupiah(metrics.flexibleAmount)}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="mt-5 grid gap-3 sm:grid-cols-3">
            <article class="rounded-[22px] border border-[#E8DED6] bg-[#FFFDFC] p-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                    <Landmark size={18} strokeWidth={1.8} />
                </div>
                <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Kita</p>
                <p class="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#37312D]">{rupiah(metrics.flexibleAmount)}</p>
                <p class="mt-1 text-xs leading-5 text-[#948980]">Ruang fleksibel bersama sampai pemasukan berikutnya.</p>
            </article>

            <article class="rounded-[22px] border border-[#E8DED6] bg-[#FFFDFC] p-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                    <WalletCards size={18} strokeWidth={1.8} />
                </div>
                <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang Kamu</p>
                <p class="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#37312D]">{rupiah(plan.personal_owner)}</p>
                <p class="mt-1 text-xs leading-5 text-[#948980]">Ruang personal yang sudah dipisahkan dari Angka Aman.</p>
            </article>

            <article class="rounded-[22px] border border-[#E8DED6] bg-[#FFFDFC] p-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE3DB] text-[#85544B]">
                    <HeartHandshake size={18} strokeWidth={1.8} />
                </div>
                <p class="mt-5 text-xs font-medium text-[#8B8178]">Uang {overview.partnerName}</p>
                <p class="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#37312D]">{rupiah(plan.personal_partner)}</p>
                <p class="mt-1 text-xs leading-5 text-[#948980]">Ruang personal pasangan yang kalian sepakati.</p>
            </article>
        </section>

        <section class="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <article class="rounded-[26px] border border-[#E4DAD1] bg-white p-5 sm:p-6">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A665D]">Kondisi bulan ini</p>
                        <h2 class="mt-1 text-base font-semibold tracking-[-0.02em] text-[#312C29]">Yang sudah punya tujuan</h2>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-[#8B8179]">
                        <CalendarDays size={15} strokeWidth={1.8} />
                        {formatDate(plan.next_income_date)}
                    </div>
                </div>

                <div class="mt-5 divide-y divide-[#EEE6DF] text-sm">
                    <div class="flex items-center justify-between gap-4 py-3">
                        <span class="text-[#776E67]">Kebutuhan & tagihan wajib</span>
                        <span class="font-medium text-[#37312D]">{rupiah(plan.fixed_commitments)}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 py-3">
                        <span class="text-[#776E67]">Cicilan / utang</span>
                        <span class="font-medium text-[#37312D]">{rupiah(plan.debt_payments)}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 py-3">
                        <span class="text-[#776E67]">Target tabungan bersama</span>
                        <span class="font-medium text-[#37312D]">{rupiah(plan.savings_target)}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 py-3">
                        <span class="text-[#776E67]">Safety buffer</span>
                        <span class="font-medium text-[#37312D]">{rupiah(plan.safety_buffer)}</span>
                    </div>
                </div>
            </article>

            <aside class="rounded-[26px] border border-[#E4DAD1] bg-[#FBF8F4] p-5 sm:p-6">
                {#if metrics.deficitAmount > 0}
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6E2DE] text-[#8A463E]">
                        <CircleAlert size={19} strokeWidth={1.8} />
                    </div>
                    <p class="mt-4 text-base font-semibold tracking-[-0.02em] text-[#3A332F]">Ada yang perlu disesuaikan</p>
                    <p class="mt-2 text-sm leading-6 text-[#7D746D]">Jumlah yang kalian alokasikan lebih besar daripada uang yang tersedia. Ubah Rencana sebelum menjadikan Angka Aman sebagai batas keputusan.</p>
                {:else}
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8EFE3] text-[#5E7458]">
                        <ShieldCheck size={19} strokeWidth={1.8} />
                    </div>
                    <p class="mt-4 text-base font-semibold tracking-[-0.02em] text-[#3A332F]">Batas sudah terlihat</p>
                    <p class="mt-2 text-sm leading-6 text-[#7D746D]">Saldo bukan lagi satu-satunya patokan. Kalian sekarang punya angka yang sudah memperhitungkan komitmen, buffer, dan ruang personal.</p>
                {/if}

                <a href="/onboarding" use:inertia class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7B4038] transition hover:text-[#5E302A]">
                    Lihat Rencana
                    <ArrowRight size={16} />
                </a>
            </aside>
        </section>
    {/if}
</AppShell>
