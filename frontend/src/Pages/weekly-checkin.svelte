<script>
    import { router } from '@inertiajs/svelte'
    import {
        ArrowLeft,
        CalendarClock,
        CheckCircle2,
        CircleAlert,
        CircleDollarSign,
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
        status: 'aman',
        topic: null,
        note: '',
    })

    const topics = [
        { value: 'pengeluaran', label: 'Pengeluaran minggu ini' },
        { value: 'target', label: 'Target bersama' },
        { value: 'cicilan', label: 'Cicilan & kewajiban' },
        { value: 'pembelian', label: 'Pembelian yang tertunda' },
        { value: 'lainnya', label: 'Hal lainnya' },
    ]

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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(Number(value)))
    }

    function topicLabel(value) {
        return topics.find((item) => item.value === value)?.label || 'Hal lainnya'
    }

    function submitForm() {
        if (form.status === 'perlu_dibicarakan' && !form.topic) return
        isLoading = true
        router.post('/mingguan', form, {
            preserveScroll: true,
            onFinish: () => {
                isLoading = false
            },
        })
    }

    const totalDecisions = summary.decisions.bought + summary.decisions.later + summary.decisions.cancelled
</script>

<svelte:head>
    <title>Ngobrol Mingguan · UANG KITA</title>
    <meta name="description" content="Luangkan beberapa menit untuk melihat kondisi uang dan menyamakan hal yang perlu dibicarakan berdua." />
</svelte:head>

<AppShell active="pulse">
    <div class="mx-auto max-w-5xl">
        <a href="/pulse-uang" class="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#E1463D] transition hover:text-[#C9362E]">
            <ArrowLeft size={15} /> Kembali ke Cek Uang
        </a>

        <section class="mb-5 rounded-[28px] bg-[#1F1F1F] p-5 text-white sm:p-7">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <MessageCircleMore size={15} /> Ngobrol Mingguan
            </div>
            <h1 class="mt-5 max-w-3xl text-[30px] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-[42px]">
                Bukan rapat keuangan. Cuma beberapa menit untuk tetap sejalan.
            </h1>
            <p class="mt-4 max-w-2xl text-sm leading-6 text-[#D7D2CE]">
                Lihat perubahan kondisi, keputusan yang dibuat, lalu tentukan apakah minggu ini aman dilanjutkan atau ada hal yang perlu dibicarakan bersama.
            </p>
        </section>

        {#if flash?.success}
            <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#DDE8D9] bg-[#F4F8F2] p-4 text-[#486043]">
                <CheckCircle2 class="mt-0.5 shrink-0" size={18} />
                <p class="text-sm leading-5">{flash.success}</p>
            </div>
        {/if}

        {#if flash?.error}
            <div class="mb-5 flex items-start gap-3 rounded-2xl border border-[#F0CFCB] bg-[#FFF5F3] p-4 text-[#9E3A33]">
                <CircleAlert class="mt-0.5 shrink-0" size={18} />
                <p class="text-sm leading-5">{flash.error}</p>
            </div>
        {/if}

        <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article class="uk-card p-4 sm:p-5">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF7F0] text-[#4D8B5B]"><WalletCards size={19} /></div>
                <p class="mt-4 text-xs font-semibold text-[#6D6964]">Uang tersedia</p>
                <p class="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#1F1F1F]">{rupiah(summary.availableMoney)}</p>
            </article>

            <article class="uk-card p-4 sm:p-5">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><CircleDollarSign size={19} /></div>
                <p class="mt-4 text-xs font-semibold text-[#6D6964]">Angka Aman mingguan</p>
                <p class="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#1F1F1F]">{rupiah(summary.metrics.safeWeekly)}</p>
            </article>

            <article class="uk-card p-4 sm:p-5">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5E9] text-[#B8791D]"><MessageCircleMore size={19} /></div>
                <p class="mt-4 text-xs font-semibold text-[#6D6964]">Keputusan sejak terakhir</p>
                <p class="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#1F1F1F]">{totalDecisions}</p>
                <p class="mt-1 text-[11px] leading-4 text-[#8A8580]">{summary.decisions.bought} beli · {summary.decisions.later} nanti · {summary.decisions.cancelled} batal</p>
            </article>

            <article class="uk-card p-4 sm:p-5">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F2EF] text-[#6D6964]">
                    {#if summary.safeWeeklyDelta !== null && summary.safeWeeklyDelta < 0}
                        <TrendingDown size={19} />
                    {:else}
                        <TrendingUp size={19} />
                    {/if}
                </div>
                <p class="mt-4 text-xs font-semibold text-[#6D6964]">Perubahan dari obrolan lalu</p>
                {#if summary.safeWeeklyDelta === null}
                    <p class="mt-1 text-base font-semibold text-[#1F1F1F]">Belum ada pembanding</p>
                {:else}
                    <p class="mt-1 text-xl font-semibold tracking-[-0.035em] {summary.safeWeeklyDelta < 0 ? 'text-[#C75A50]' : 'text-[#4D8B5B]'}">
                        {summary.safeWeeklyDelta > 0 ? '+' : ''}{compactRupiah(summary.safeWeeklyDelta)}
                    </p>
                {/if}
            </article>
        </section>

        <section class="mt-5 uk-card p-5 sm:p-6">
            <p class="text-xs font-semibold text-[#E1463D]">Bahan obrolan minggu ini</p>
            <p class="mt-2 max-w-3xl text-lg font-semibold leading-7 tracking-[-0.02em] text-[#1F1F1F]">{summary.conversationPrompt}</p>
        </section>

        {#if summary.dueNow}
            <section class="mt-5 uk-card p-5 sm:p-6">
                <div class="max-w-3xl">
                    <p class="text-xs font-semibold text-[#E1463D]">Sepakati bersama</p>
                    <h2 class="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#1F1F1F]">Setelah lihat kondisi ini, kalian merasa...</h2>
                </div>

                <form class="mt-6" onsubmit={(event) => { event.preventDefault(); submitForm(); }}>
                    <div class="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onclick={() => { form.status = 'aman'; form.topic = null; }}
                            class="rounded-[22px] border p-5 text-left transition {form.status === 'aman' ? 'border-[#A8CBB0] bg-[#F2F8F3] ring-2 ring-[#DDEBDF]' : 'border-[#E8E3DF] bg-white hover:bg-[#FAF8F6]'}"
                        >
                            <div class="flex items-center gap-3">
                                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E4F2E7] text-[#4D8B5B]"><CheckCircle2 size={19} /></div>
                                <div>
                                    <p class="text-sm font-semibold text-[#1F1F1F]">Aman, lanjutkan</p>
                                    <p class="mt-1 text-xs leading-5 text-[#77716D]">Kondisi dan keputusan minggu ini masih terasa sejalan.</p>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onclick={() => { form.status = 'perlu_dibicarakan'; }}
                            class="rounded-[22px] border p-5 text-left transition {form.status === 'perlu_dibicarakan' ? 'border-[#F0CFCB] bg-[#FFF5F3] ring-2 ring-[#F7DFDC]' : 'border-[#E8E3DF] bg-white hover:bg-[#FAF8F6]'}"
                        >
                            <div class="flex items-center gap-3">
                                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><MessageCircleMore size={19} /></div>
                                <div>
                                    <p class="text-sm font-semibold text-[#1F1F1F]">Ada yang perlu dibicarakan</p>
                                    <p class="mt-1 text-xs leading-5 text-[#77716D]">Nggak harus diselesaikan sekarang. Tandai dulu apa yang perlu dibahas.</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {#if form.status === 'perlu_dibicarakan'}
                        <div class="mt-6">
                            <label class="block text-sm font-semibold text-[#3F3B38]">Yang paling perlu dibicarakan</label>
                            <div class="mt-3 flex flex-wrap gap-2">
                                {#each topics as item}
                                    <button
                                        type="button"
                                        onclick={() => { form.topic = item.value; }}
                                        class="rounded-full border px-3.5 py-2 text-xs font-semibold transition {form.topic === item.value ? 'border-[#E1463D] bg-[#FFF1EF] text-[#C9362E]' : 'border-[#E8E3DF] bg-white text-[#625D59] hover:bg-[#FAF8F6]'}"
                                    >
                                        {item.label}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <div class="mt-6">
                        <label for="note" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Catatan singkat <span class="font-normal text-[#8A8580]">(opsional)</span></label>
                        <textarea
                            id="note"
                            bind:value={form.note}
                            maxlength="240"
                            rows="3"
                            placeholder="Contoh: Minggu ini pengeluaran makan terasa lebih besar dari biasanya."
                            class="uk-input resize-none px-4 py-3.5 text-sm leading-6"
                        ></textarea>
                        <p class="mt-1.5 text-right text-[11px] text-[#8A8580]">{form.note.length}/240</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (form.status === 'perlu_dibicarakan' && !form.topic)}
                        class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        {#if isLoading}
                            <LoaderCircle class="animate-spin" size={18} /> Menyimpan...
                        {:else}
                            Simpan obrolan minggu ini
                        {/if}
                    </button>
                </form>
            </section>
        {:else}
            <section class="mt-5 flex items-start gap-3 rounded-[24px] border border-[#DDE8D9] bg-[#F4F8F2] p-5 text-[#486043] sm:p-6">
                <CalendarClock class="mt-0.5 shrink-0" size={20} />
                <div>
                    <p class="text-sm font-semibold">Obrolan minggu ini sudah selesai.</p>
                    <p class="mt-1 text-xs leading-5">Kembali lagi sekitar {summary.daysUntilDue} hari lagi. Kalau kondisi uang berubah sebelum itu, cukup perbarui lewat Cek Uang.</p>
                </div>
            </section>
        {/if}

        {#if summary.recentCheckins?.length}
            <section class="mt-6 uk-card p-5 sm:p-6">
                <div>
                    <p class="text-xs font-semibold text-[#E1463D]">Riwayat obrolan</p>
                    <h2 class="mt-1 text-lg font-semibold text-[#1F1F1F]">Apa yang kalian rasakan dari minggu ke minggu</h2>
                </div>
                <div class="mt-5 divide-y divide-[#F0ECE8]">
                    {#each summary.recentCheckins as item}
                        <div class="py-4 first:pt-0 last:pb-0">
                            <div class="flex items-start justify-between gap-4">
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span class="rounded-full px-2.5 py-1 text-[10px] font-semibold {item.status === 'aman' ? 'bg-[#EEF7F0] text-[#4D8B5B]' : 'bg-[#FFF1EF] text-[#C9362E]'}">
                                            {item.status === 'aman' ? 'Aman, lanjutkan' : 'Perlu dibicarakan'}
                                        </span>
                                        {#if item.topic}
                                            <span class="rounded-full bg-[#FAF8F6] px-2.5 py-1 text-[10px] font-semibold text-[#6D6964]">{topicLabel(item.topic)}</span>
                                        {/if}
                                    </div>
                                    <p class="mt-2 text-xs text-[#8A8580]">{formatDateTime(item.created_at)} · {item.actor_name || 'Pengguna'}</p>
                                    {#if item.note}
                                        <p class="mt-2 max-w-2xl text-sm leading-6 text-[#56514D]">{item.note}</p>
                                    {/if}
                                </div>
                                <div class="shrink-0 text-right">
                                    <p class="text-sm font-semibold text-[#1F1F1F]">{compactRupiah(item.safe_weekly)}/minggu</p>
                                    <p class="mt-1 text-[11px] text-[#8A8580]">{item.decisions_bought + item.decisions_later + item.decisions_cancelled} keputusan</p>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
    </div>
</AppShell>
