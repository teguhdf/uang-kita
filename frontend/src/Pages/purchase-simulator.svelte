<script>
  import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CircleDollarSign,
    MessageCircleMore,
    ReceiptText,
    ShieldCheck,
    ShoppingBag,
    WalletCards,
  } from 'lucide-svelte'
  import AppShell from '../Components/UangKita/AppShell.svelte'

  let { overview } = $props()
  let itemName = $state('')
  let purchaseAmount = $state(0)

  let flexibleBefore = $derived(Number(overview?.metrics?.flexibleAmount || 0))
  let daysRemaining = $derived(Math.max(1, Number(overview?.metrics?.daysRemaining || 1)))
  let normalizedAmount = $derived(Math.max(0, Number(purchaseAmount || 0)))
  let flexibleAfter = $derived(Math.max(0, flexibleBefore - normalizedAmount))
  let deficitAfter = $derived(Math.max(0, normalizedAmount - flexibleBefore))
  let safeDailyAfter = $derived(Math.floor(flexibleAfter / daysRemaining))
  let safeWeeklyAfter = $derived(Math.floor(flexibleAfter / Math.max(1, daysRemaining / 7)))
  let impactState = $derived(
    normalizedAmount <= 0
      ? 'empty'
      : normalizedAmount > flexibleBefore
        ? 'over'
        : normalizedAmount === flexibleBefore
          ? 'all'
          : 'within'
  )

  let decisionState = $derived(
    normalizedAmount <= 0
      ? 'empty'
      : !overview?.decisionRule
        ? 'unconfigured'
        : normalizedAmount <= Number(overview.decisionRule.free_limit)
          ? 'free'
          : normalizedAmount <= Number(overview.decisionRule.notify_limit)
            ? 'notify'
            : 'discuss'
  )

  function rupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }
</script>

<svelte:head>
  <title>Aman Kalau Dibeli? · UANG KITA</title>
  <meta name="description" content="Lihat dampak sebuah pembelian ke uang fleksibel dan Angka Aman sebelum transaksi terjadi." />
</svelte:head>

<AppShell active="decisions">
  <div class="mx-auto max-w-4xl">
    <section class="mb-6 sm:mb-8">
      <p class="text-xs font-medium text-[#9A665D]">Keputusan sebelum uang keluar</p>
      <h1 class="mt-2 max-w-2xl text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#292421] sm:text-4xl">Aman kalau dibeli?</h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[#766D66] sm:text-[15px]">
        Lihat dua hal sekaligus: dampaknya ke ruang fleksibel dan cara mengambil keputusan sesuai kesepakatan kalian.
      </p>
    </section>

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div class="space-y-4">
        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <ShoppingBag size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Coba satu pembelian</h2>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Belum ada transaksi yang dicatat. Ini hanya simulasi sebelum kalian memutuskan.</p>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <div>
              <label for="item_name" class="mb-2 block text-sm font-medium text-[#4A433E]">Mau beli apa?</label>
              <div class="relative">
                <ReceiptText class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2978E]" size={18} />
                <input id="item_name" type="text" bind:value={itemName} placeholder="Contoh: sepatu kerja" class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9C9189] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              </div>
            </div>

            <div>
              <label for="purchase_amount" class="mb-2 block text-sm font-medium text-[#4A433E]">Harganya berapa?</label>
              <div class="relative">
                <CircleDollarSign class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2978E]" size={18} />
                <input id="purchase_amount" type="number" min="0" step="1000" bind:value={purchaseAmount} placeholder="0" class="w-full rounded-2xl border border-[#DED4CB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#2D2825] outline-none transition placeholder:text-[#9C9189] focus:border-[#9A665D] focus:ring-4 focus:ring-[#9A665D]/10" />
              </div>
              <p class="mt-1.5 text-[11px] text-[#978D85]">{rupiah(normalizedAmount)}</p>
            </div>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#E5DAD1] bg-white p-5 sm:p-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              <WalletCards size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em] text-[#332E2A]">Sebelum vs sesudah</h2>
              <p class="mt-0.5 text-xs text-[#90867E]">Dampak langsung ke uang yang masih fleksibel.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl bg-[#F8F4F0] p-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B8F87]">Sebelum beli</p>
              <p class="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#332E2A]">{rupiah(flexibleBefore)}</p>
              <p class="mt-1 text-xs leading-5 text-[#8A8078]">Ruang fleksibel saat ini.</p>
            </div>

            <div class="rounded-2xl bg-[#F1E6DF] p-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8D625A]">Setelah beli</p>
              <p class="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#633B35]">{rupiah(flexibleAfter)}</p>
              <p class="mt-1 text-xs leading-5 text-[#866C65]">
                {#if deficitAfter > 0}Kurang {rupiah(deficitAfter)} dari ruang fleksibel.{:else}Sisa sampai pemasukan berikutnya.{/if}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#E5DAD1] bg-[#FFFDFC] p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2E7DF] text-[#7B4038]">
              {#if decisionState === 'notify'}
                <Bell size={19} strokeWidth={1.8} />
              {:else}
                <MessageCircleMore size={19} strokeWidth={1.8} />
              {/if}
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A665D]">Menurut kesepakatan kalian</p>
              {#if decisionState === 'empty'}
                <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#332E2A]">Masukkan harga dulu.</h2>
              {:else if decisionState === 'unconfigured'}
                <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#332E2A]">Aturan keputusan belum dibuat.</h2>
                <p class="mt-1 text-xs leading-5 text-[#8A8078]">Buat dua batas sederhana supaya simulator bisa membedakan kapan bebas, kasih tahu, atau ngobrol dulu.</p>
                <a href="/aturan-keputusan" class="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#7B4038]">Buat aturan <ArrowRight size={14} /></a>
              {:else if decisionState === 'free'}
                <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#332E2A]">Bebas diputuskan sendiri.</h2>
                <p class="mt-1 text-xs leading-5 text-[#8A8078]">Nominal ini masih berada di dalam Batas Bebas yang kalian sepakati.</p>
              {:else if decisionState === 'notify'}
                <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#332E2A]">Kasih tahu pasangan.</h2>
                <p class="mt-1 text-xs leading-5 text-[#8A8078]">Nominal ini melewati Batas Bebas, tapi masih di dalam Batas Kasih Tahu.</p>
              {:else}
                <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#332E2A]">Ngobrol dulu.</h2>
                <p class="mt-1 text-xs leading-5 text-[#8A8078]">Nominal ini melewati Batas Kasih Tahu yang kalian sepakati. Bukan berarti otomatis tidak boleh.</p>
              {/if}
            </div>
          </div>
        </section>
      </div>

      <aside class="lg:sticky lg:top-8 lg:self-start">
        <section class="rounded-[28px] bg-[#342E2A] p-5 text-[#F8F3EE] shadow-[0_18px_60px_rgba(52,46,42,0.12)] sm:p-6">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#E8D8CF]">
            {#if impactState === 'over'}<AlertTriangle size={14} /> Melewati ruang fleksibel{:else}<ShieldCheck size={14} /> Dampak pembelian{/if}
          </div>

          {#if impactState === 'empty'}
            <h2 class="mt-5 text-2xl font-semibold leading-tight tracking-[-0.035em]">Masukkan harga untuk melihat dampaknya.</h2>
            <p class="mt-3 text-sm leading-6 text-[#D8CEC7]">Angka sebelum dan sesudah akan dibandingkan tanpa mengubah data bulan ini.</p>
          {:else if impactState === 'over'}
            <h2 class="mt-5 text-2xl font-semibold leading-tight tracking-[-0.035em]">Pembelian ini melewati ruang fleksibel {rupiah(deficitAfter)}.</h2>
            <p class="mt-3 text-sm leading-6 text-[#D8CEC7]">Kalau tetap dilakukan, ada alokasi lain yang perlu berubah. Aplikasi tidak menentukan mana yang harus dikorbankan.</p>
          {:else if impactState === 'all'}
            <h2 class="mt-5 text-2xl font-semibold leading-tight tracking-[-0.035em]">Pembelian ini menghabiskan seluruh ruang fleksibel.</h2>
            <p class="mt-3 text-sm leading-6 text-[#D8CEC7]">Setelah pembelian, tidak ada sisa fleksibel sampai pemasukan berikutnya.</p>
          {:else}
            <h2 class="mt-5 text-2xl font-semibold leading-tight tracking-[-0.035em]">Masih berada di dalam ruang fleksibel kalian.</h2>
            <p class="mt-3 text-sm leading-6 text-[#D8CEC7]">Lihat perubahan Angka Aman di bawah sebelum kalian memutuskan.</p>
          {/if}

          <div class="mt-6 space-y-4 border-t border-white/10 pt-5">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CDB8AB]">Angka Aman / minggu setelah beli</p>
              <p class="mt-1.5 text-xl font-semibold">{rupiah(safeWeeklyAfter)}</p>
              <p class="mt-1 text-xs text-[#CFC4BC]">Sebelumnya {rupiah(overview?.metrics?.safeWeekly || 0)}</p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CDB8AB]">Angka Aman / hari setelah beli</p>
              <p class="mt-1.5 text-xl font-semibold">{rupiah(safeDailyAfter)}</p>
              <p class="mt-1 text-xs text-[#CFC4BC]">Sebelumnya {rupiah(overview?.metrics?.safeDaily || 0)}</p>
            </div>
          </div>

          <div class="mt-6 rounded-2xl bg-white/7 p-4">
            <p class="text-xs leading-5 text-[#D8CEC7]">{itemName.trim() ? `“${itemName.trim()}”` : 'Pembelian ini'} masih berupa simulasi. Belum mengubah saldo atau tercatat sebagai transaksi.</p>
          </div>

          <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            <a href="/aturan-keputusan" class="inline-flex items-center gap-2 text-xs font-semibold text-[#E8D8CF] transition hover:text-white">Atur kesepakatan <ArrowRight size={14} /></a>
            <a href="/onboarding" class="inline-flex items-center gap-2 text-xs font-semibold text-[#E8D8CF] transition hover:text-white">Ubah rencana <ArrowRight size={14} /></a>
          </div>
        </section>
      </aside>
    </div>
  </div>
</AppShell>
