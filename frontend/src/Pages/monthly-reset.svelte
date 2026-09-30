<script>
    import { router, inertia } from "@inertiajs/svelte";
    import {
        ArrowRight,
        CalendarDays,
        CircleAlert,
        CircleCheck,
        CircleDollarSign,
        LoaderCircle,
        PencilLine,
        RotateCcw,
        ShieldCheck,
        WalletCards,
    } from "lucide-svelte";
    import AppShell from "../Components/UangKita/AppShell.svelte";

    let { overview, flash } = $props();
    const carryover = overview?.carryoverSeed;
    let isLoading = $state(false);

    function localDateInput(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function defaultNextIncomeDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return localDateInput(date);
    }

    function formatPeriod(value) {
        if (!value) return "bulan sebelumnya";
        const date = new Date(`${value}-01T00:00:00`);
        if (Number.isNaN(date.getTime())) return "bulan sebelumnya";
        return new Intl.DateTimeFormat("id-ID", {
            month: "long",
            year: "numeric",
        }).format(date);
    }

    function daysUntil(value) {
        if (!value) return 1;
        const target = new Date(`${value}T00:00:00`);
        if (Number.isNaN(target.getTime())) return 1;
        const now = new Date();
        const dayMs = 24 * 60 * 60 * 1000;
        return Math.max(1, Math.ceil((target.getTime() - now.getTime()) / dayMs));
    }

    function rupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    }

    let form = $state({
        available_money: 0,
        next_income_date: defaultNextIncomeDate(),
    });

    let totalAllocated = $derived(
        Number(carryover?.fixed_commitments || 0) +
        Number(carryover?.debt_payments || 0) +
        Number(carryover?.savings_target || 0) +
        Number(carryover?.safety_buffer || 0) +
        Number(carryover?.personal_owner || 0) +
        Number(carryover?.personal_partner || 0)
    );
    let flexibleAmount = $derived(Math.max(0, Number(form.available_money || 0) - totalAllocated));
    let deficitAmount = $derived(Math.max(0, totalAllocated - Number(form.available_money || 0)));
    let daysRemaining = $derived(daysUntil(form.next_income_date));
    let safeDaily = $derived(Math.floor(flexibleAmount / Math.max(1, daysRemaining)));
    let safeWeekly = $derived(Math.floor(flexibleAmount / Math.max(1, daysRemaining / 7)));

    function submitForm() {
        isLoading = true;
        router.post("/mulai-bulan-baru", form, {
            preserveScroll: true,
            onFinish: () => {
                isLoading = false;
            },
        });
    }
</script>

<svelte:head>
    <title>Mulai bulan baru · UANG KITA</title>
    <meta name="description" content="Bawa struktur bulan sebelumnya dan perbarui kondisi aktual dalam kurang dari satu menit." />
</svelte:head>

<AppShell active="plan">
    <div class="mx-auto max-w-4xl">
        <section class="mb-6">
            <div class="inline-flex items-center gap-2 rounded-full bg-[#FFF1EF] px-3 py-1.5 text-xs font-semibold text-[#C9362E]">
                <RotateCcw size={15} /> Pergantian bulan
            </div>
            <h1 class="mt-4 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Mulai bulan baru tanpa isi ulang semuanya.</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-[#68635F] sm:text-[15px]">
                Struktur {formatPeriod(carryover?.sourcePeriod)} sudah kami bawa. Cukup perbarui uang yang benar-benar tersedia sekarang dan kapan pemasukan berikutnya masuk.
            </p>
        </section>

        {#if flash?.error}
            <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
                <CircleAlert class="mt-0.5 shrink-0" size={18} />
                <p class="text-sm leading-5">{flash.error}</p>
            </div>
        {/if}

        <form class="grid gap-4 lg:grid-cols-[1fr_330px]" onsubmit={(event) => { event.preventDefault(); submitForm(); }}>
            <div class="space-y-4">
                <section class="uk-card p-5 sm:p-6">
                    <div class="flex items-start gap-3">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF7F0] text-[#4D8B5B]"><WalletCards size={20} /></div>
                        <div>
                            <h2 class="text-base font-semibold text-[#1F1F1F]">Kondisi aktual</h2>
                            <p class="mt-1 text-xs leading-5 text-[#77716D]">Jangan pakai angka bulan lalu. Masukkan uang yang benar-benar bisa dipakai sekarang.</p>
                        </div>
                    </div>

                    <div class="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label for="available_money" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Uang tersedia sekarang</label>
                            <input id="available_money" name="available_money" type="number" min="0" step="1000" required bind:value={form.available_money} class="uk-input px-4 py-3.5 text-[15px]" />
                            <p class="mt-1.5 text-[11px] font-medium text-[#817C77]">{rupiah(form.available_money)}</p>
                        </div>

                        <div>
                            <label for="next_income_date" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Pemasukan berikutnya</label>
                            <div class="relative">
                                <CalendarDays class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
                                <input id="next_income_date" name="next_income_date" type="date" min={localDateInput()} required bind:value={form.next_income_date} class="uk-input py-3.5 pl-12 pr-4 text-[15px]" />
                            </div>
                        </div>
                    </div>
                </section>

                <section class="uk-card p-5 sm:p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-xs font-semibold text-[#E1463D]">Dibawa dari {formatPeriod(carryover?.sourcePeriod)}</p>
                            <h2 class="mt-1 text-base font-semibold text-[#1F1F1F]">Struktur rutin kalian</h2>
                        </div>
                        <CircleCheck class="shrink-0 text-[#4D8B5B]" size={20} />
                    </div>

                    <div class="mt-5 divide-y divide-[#F0ECE8] text-sm">
                        <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Pemasukan rutin</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(carryover?.monthly_income)}</strong></div>
                        <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Kebutuhan & tagihan wajib</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(carryover?.fixed_commitments)}</strong></div>
                        <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Cicilan / utang</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(carryover?.debt_payments)}</strong></div>
                        <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Target tabungan</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(carryover?.savings_target)}</strong></div>
                        <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Dana penyangga</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(carryover?.safety_buffer)}</strong></div>
                        <div class="flex justify-between gap-4 py-3"><span class="text-[#6D6964]">Ruang pribadi berdua</span><strong class="font-semibold text-[#1F1F1F]">{rupiah(Number(carryover?.personal_owner || 0) + Number(carryover?.personal_partner || 0))}</strong></div>
                    </div>

                    <a href="/rencana-lengkap" use:inertia class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#625D59] transition hover:text-[#E1463D]">
                        <PencilLine size={15} /> Ada yang berubah? Atur lengkap
                    </a>
                </section>
            </div>

            <aside class="lg:sticky lg:top-8 lg:self-start">
                <section class="overflow-hidden rounded-[24px] bg-[#1F1F1F] text-white shadow-[0_16px_48px_rgba(31,31,31,0.12)]">
                    <div class="p-5 sm:p-6">
                        <div class="flex items-center gap-2 text-[#F3B2AC]">
                            <ShieldCheck size={17} />
                            <p class="text-[10px] font-semibold uppercase tracking-[0.16em]">Pratinjau Angka Aman</p>
                        </div>

                        {#if deficitAmount > 0}
                            <p class="mt-5 text-xs text-[#F3B2AC]">Alokasi masih lebih besar dari uang tersedia</p>
                            <p class="mt-1 text-[30px] font-semibold tracking-[-0.04em]">-{rupiah(deficitAmount)}</p>
                            <p class="mt-2 text-xs leading-5 text-[#D7D2CE]">Ubah struktur lengkap kalau kondisi bulan ini memang berbeda.</p>
                        {:else}
                            <p class="mt-5 text-[30px] font-semibold tracking-[-0.04em]">{rupiah(safeWeekly)}</p>
                            <p class="mt-2 text-xs leading-5 text-[#D7D2CE]">Sekitar <strong class="text-white">{rupiah(safeDaily)}</strong> per hari selama {daysRemaining} hari.</p>
                        {/if}

                        <div class="mt-5 rounded-2xl bg-white/7 p-4">
                            <div class="flex items-center justify-between gap-3 text-xs">
                                <span class="text-[#CFC9C5]">Sudah dialokasikan</span>
                                <strong>{rupiah(totalAllocated)}</strong>
                            </div>
                            <div class="mt-2 flex items-center justify-between gap-3 text-xs">
                                <span class="text-[#CFC9C5]">Masih fleksibel</span>
                                <strong>{rupiah(flexibleAmount)}</strong>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-60">
                            {#if isLoading}
                                <LoaderCircle class="animate-spin" size={17} /> Menyiapkan bulan baru
                            {:else}
                                Mulai bulan ini <ArrowRight size={17} />
                            {/if}
                        </button>
                    </div>
                </section>

                <div class="mt-3 flex items-start gap-2 px-1 text-[11px] leading-5 text-[#817C77]">
                    <CircleDollarSign class="mt-0.5 shrink-0" size={14} />
                    <p>Proses ini membuat periode baru. Data bulan sebelumnya tetap tersimpan dan tidak diubah.</p>
                </div>
            </aside>
        </form>
    </div>
</AppShell>
