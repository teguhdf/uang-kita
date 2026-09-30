<script>
    import { router } from '@inertiajs/svelte'
    import {
        ArrowLeft,
        ArrowRight,
        CircleAlert,
        CircleCheck,
        Clock3,
        LoaderCircle,
        MessageCircleMore,
        TrendingDown,
        TrendingUp,
        WalletCards,
    } from 'lucide-svelte'
    import AppShell from '../Components/UangKita/AppShell.svelte'

    let { summary, flash } = $props()
    let isLoading = $state(false)
    let form = $state({
        available_money: summary?.currentAvailableMoney ?? 0,
    })

    function rupiah(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value || 0))
    }

    function compactRupiah(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(Number(value || 0))
    }

    function formatDateTime(value) {
        if (!value) return '-'
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(Number(value)))
    }

    function submitForm() {
        isLoading = true
        router.post('/pulse-uang', form, {
            preserveScroll: true,
            onFinish: () => {
                isLoading = false
            },
        })
    }

    const delta = summary?.safeDailyDelta ?? null
</script>

<svelte:head>
    <title>Cek Uang · UANG KITA</title>
    <meta name="description" content="Perbarui kondisi uang aktual supaya Angka Aman tetap relevan sepanjang bulan." />
</svelte:head>

<AppShell active="pulse">
    <div class="mx-auto max-w-5xl">
        <a href="/home" class="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#E1463D] transition hover:text-[#C9362E]">
            <ArrowLeft size={15} /> Kembali ke beranda
        </a>

        <section class="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article class="rounded-[26px] bg-[#1F1F1F] p-5 text-white sm:p-7">
                <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                    <WalletCards size={15} /> Cek Uang
                </div>
                <h1 class="mt-5 text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[42px]">
                    Biar Angka Aman tetap mengikuti kondisi nyata.
                </h1>
                <p class="mt-4 max-w-xl text-sm leading-6 text-[#D7D2CE]">
                    Nggak perlu catat setiap transaksi. Cukup perbarui total uang yang benar-benar tersedia sekarang, lalu UANG KITA menghitung ulang ruang aman kalian.
                </p>

                <div class="mt-7 grid gap-3 sm:grid-cols-2">
                    <div class="rounded-2xl bg-white/8 p-4">
                        <p class="text-xs text-[#CFC9C4]">Uang tersedia sekarang</p>
                        <p class="mt-1 text-2xl font-semibold tracking-[-0.035em]">{rupiah(summary.currentAvailableMoney)}</p>
                    </div>
                    <div class="rounded-2xl bg-white/8 p-4">
                        <p class="text-xs text-[#CFC9C4]">Angka Aman harian</p>
                        <p class="mt-1 text-2xl font-semibold tracking-[-0.035em]">{rupiah(summary.currentMetrics.safeDaily)}</p>
                    </div>
                </div>
            </article>

            <article class="uk-card p-5 sm:p-6">
                <p class="text-xs font-semibold text-[#E1463D]">Perbarui kondisi aktual</p>
                <h2 class="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1F1F1F]">Uang yang benar-benar tersedia sekarang berapa?</h2>
                <p class="mt-2 text-sm leading-6 text-[#6D6964]">Gunakan total uang yang memang bisa dipakai untuk kebutuhan rumah tangga saat ini.</p>

                {#if flash?.error}
                    <div class="mt-4 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
                        <CircleAlert class="mt-0.5 shrink-0" size={18} />
                        <p class="text-sm leading-5">{flash.error}</p>
                    </div>
                {/if}

                <form class="mt-6" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
                    <label for="available_money" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Uang tersedia saat ini</label>
                    <div class="relative">
                        <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#77716D]">Rp</span>
                        <input
                            bind:value={form.available_money}
                            id="available_money"
                            name="available_money"
                            type="number"
                            min="0"
                            step="1"
                            inputmode="numeric"
                            required
                            class="uk-input py-4 pl-12 pr-4 text-lg font-semibold"
                        />
                    </div>
                    <p class="mt-2 text-xs leading-5 text-[#8A8580]">Tidak perlu sama dengan saldo satu rekening. Masukkan total uang yang benar-benar kalian anggap tersedia.</p>

                    <button type="submit" disabled={isLoading} class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-60">
                        {#if isLoading}
                            <LoaderCircle class="animate-spin" size={18} /> Memperbarui...
                        {:else}
                            Perbarui kondisi <ArrowRight size={17} />
                        {/if}
                    </button>
                </form>
            </article>
        </section>

        <a href="/mingguan" class="mt-5 flex items-center gap-4 rounded-[24px] border border-[#E8E3DF] bg-[#FAFAF8] p-5 transition hover:border-[#F0CFCB] hover:bg-[#FFF9F8] sm:p-6">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><MessageCircleMore size={20} /></div>
            <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-[#E1463D]">Ngobrol Mingguan</p>
                <p class="mt-1 text-sm font-semibold text-[#1F1F1F]">Sudah lihat angkanya? Sekarang samakan apa yang kalian rasakan.</p>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Beberapa menit saja untuk menentukan apakah minggu ini aman dilanjutkan atau ada hal yang perlu dibahas.</p>
            </div>
            <ArrowRight class="shrink-0 text-[#9B958F]" size={18} />
        </a>

        {#if summary.lastPulse}
            <section class="mt-5 grid gap-3 md:grid-cols-3">
                <article class="uk-card p-5">
                    <div class="flex items-center gap-2 text-xs font-semibold text-[#6D6964]"><Clock3 size={15} /> Pembaruan terakhir</div>
                    <p class="mt-3 text-xl font-semibold text-[#1F1F1F]">{formatDateTime(summary.lastPulse.created_at)}</p>
                    <p class="mt-1 text-xs text-[#8A8580]">oleh {summary.lastPulse.actor_name || 'Pengguna'}</p>
                </article>

                <article class="uk-card p-5">
                    <div class="flex items-center gap-2 text-xs font-semibold text-[#6D6964]">Perubahan Angka Aman</div>
                    {#if delta === null}
                        <p class="mt-3 text-xl font-semibold text-[#1F1F1F]">Belum ada pembanding</p>
                        <p class="mt-1 text-xs text-[#8A8580]">Pembaruan berikutnya akan mulai menunjukkan perubahan.</p>
                    {:else if delta >= 0}
                        <div class="mt-3 flex items-center gap-2 text-[#4D8B5B]"><TrendingUp size={20} /><p class="text-xl font-semibold">+{rupiah(delta)}/hari</p></div>
                        <p class="mt-1 text-xs text-[#8A8580]">Ruang harian membaik dibanding catatan sebelumnya.</p>
                    {:else}
                        <div class="mt-3 flex items-center gap-2 text-[#C75A50]"><TrendingDown size={20} /><p class="text-xl font-semibold">{rupiah(delta)}/hari</p></div>
                        <p class="mt-1 text-xs text-[#8A8580]">Ruang harian lebih ketat dibanding catatan sebelumnya.</p>
                    {/if}
                </article>

                <article class="uk-card p-5">
                    <div class="flex items-center gap-2 text-xs font-semibold text-[#6D6964]"><CircleCheck size={15} /> Kondisi terbaru</div>
                    <p class="mt-3 text-xl font-semibold text-[#1F1F1F]">{rupiah(summary.currentMetrics.safeWeekly)}/minggu</p>
                    <p class="mt-1 text-xs text-[#8A8580]">{summary.currentMetrics.daysRemaining} hari menuju pemasukan berikutnya.</p>
                </article>
            </section>
        {/if}

        {#if summary.recentSnapshots?.length > 1}
            <section class="mt-6 uk-card p-5 sm:p-6">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-xs font-semibold text-[#E1463D]">Riwayat kondisi</p>
                        <h2 class="mt-1 text-lg font-semibold text-[#1F1F1F]">Perubahan kondisi bulan ini</h2>
                    </div>
                </div>
                <div class="mt-5 divide-y divide-[#F0ECE8]">
                    {#each summary.recentSnapshots as item}
                        <div class="flex items-center justify-between gap-4 py-3.5">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-semibold text-[#1F1F1F]">{compactRupiah(item.available_money)}</span>
                                    <span class="rounded-full bg-[#FAF8F6] px-2 py-0.5 text-[10px] font-semibold text-[#77716D]">{item.source === 'baseline' ? 'Awal' : 'Pembaruan'}</span>
                                </div>
                                <p class="mt-1 text-xs text-[#8A8580]">{formatDateTime(item.created_at)} · {item.actor_name || 'Pengguna'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-semibold text-[#1F1F1F]">{compactRupiah(item.safe_daily)}/hari</p>
                                <p class="mt-1 text-[11px] text-[#8A8580]">{compactRupiah(item.safe_weekly)}/minggu</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
    </div>
</AppShell>
