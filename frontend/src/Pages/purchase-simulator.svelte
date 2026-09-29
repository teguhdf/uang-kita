<script>
  import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CheckCircle2,
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
  <meta name="description" content="Lihat dampak pembelian ke uang fleksibel dan kesepakatan pasangan sebelum uang keluar." />
</svelte:head>

<AppShell active="decisions">
  <div class="mx-auto max-w-5xl">
    <section class="mb-6">
      <p class="text-xs font-semibold text-[#E1463D]">Keputusan</p>
      <h1 class="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1F1F1F] sm:text-[38px]">Aman kalau dibeli?</h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[#68635F] sm:text-[15px]">
        Cek dampak pembelian ke uang fleksibel kalian dan lihat cara mengambil keputusan sesuai kesepakatan berdua.
      </p>
    </section>

    <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section class="uk-card p-5 sm:p-6">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]"><ShoppingBag size={19} /></div>
          <div>
            <h2 class="text-base font-semibold text-[#1F1F1F]">Coba satu pembelian</h2>
            <p class="mt-1 text-xs leading-5 text-[#77716D]">Simulasi saja. Belum mengubah data bulan ini.</p>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <div>
            <label for="item_name" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Nama barang</label>
            <div class="relative">
              <ReceiptText class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
              <input id="item_name" type="text" bind:value={itemName} placeholder="Contoh: sepatu lari" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
            </div>
          </div>

          <div>
            <label for="purchase_amount" class="mb-2 block text-sm font-semibold text-[#3F3B38]">Harganya berapa?</label>
            <div class="relative">
              <CircleDollarSign class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8782]" size={18} />
              <input id="purchase_amount" type="number" min="0" step="1000" bind:value={purchaseAmount} placeholder="0" class="uk-input py-3.5 pl-12 pr-4 text-[15px] placeholder:text-[#A39D98]" />
            </div>
            <p class="mt-1.5 text-[11px] font-medium text-[#8C8782]">{rupiah(normalizedAmount)}</p>
          </div>
        </div>

        <div class="mt-6 rounded-2xl bg-[#FAFAF8] p-4">
          <p class="text-xs font-semibold text-[#68635F]">Angka Aman saat ini</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p class="text-[11px] text-[#8C8782]">Per minggu</p>
              <p class="mt-1 text-base font-semibold text-[#1F1F1F]">{rupiah(overview?.metrics?.safeWeekly || 0)}</p>
            </div>
            <div>
              <p class="text-[11px] text-[#8C8782]">Per hari</p>
              <p class="mt-1 text-base font-semibold text-[#1F1F1F]">{rupiah(overview?.metrics?.safeDaily || 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="space-y-4">
        <section class="uk-card p-5 sm:p-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4F8F2] text-[#5C8E63]"><WalletCards size={19} /></div>
            <div>
              <h2 class="text-base font-semibold text-[#1F1F1F]">Dampak ke uang fleksibel</h2>
              <p class="mt-0.5 text-xs text-[#77716D]">Sebelum dan sesudah pembelian.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-[#EEEAE6] bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#817C77]">Sebelum beli</p>
              <p class="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1F1F1F]">{rupiah(flexibleBefore)}</p>
              <p class="mt-1 text-xs text-[#77716D]">Ruang fleksibel saat ini.</p>
            </div>
            <div class="rounded-2xl border border-[#F2DED9] bg-[#FFF8F6] p-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B0443C]">Setelah beli</p>
              <p class="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1F1F1F]">{rupiah(flexibleAfter)}</p>
              <p class="mt-1 text-xs text-[#77716D]">{#if deficitAfter > 0}Kurang {rupiah(deficitAfter)} dari ruang fleksibel.{:else}Sisa sampai pemasukan berikutnya.{/if}</p>
            </div>
          </div>
        </section>

        <section class="rounded-[24px] border p-5 sm:p-6 {impactState === 'over' ? 'border-[#F1CCC7] bg-[#FFF5F3]' : impactState === 'empty' ? 'border-[#EEEAE6] bg-[#FAFAF8]' : 'border-[#D9E9D6] bg-[#F4F8F2]'}">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full {impactState === 'over' ? 'bg-[#FCE5E1] text-[#D3473E]' : impactState === 'empty' ? 'bg-white text-[#7B7772]' : 'bg-[#DDF0D8] text-[#4F8E59]'}">
              {#if impactState === 'over'}<AlertTriangle size={20} />{:else if impactState === 'empty'}<ShieldCheck size={20} />{:else}<CheckCircle2 size={20} />{/if}
            </div>
            <div>
              {#if impactState === 'empty'}
                <h2 class="text-lg font-semibold text-[#1F1F1F]">Masukkan harga untuk melihat hasil.</h2>
                <p class="mt-1 text-sm leading-6 text-[#68635F]">UANG KITA akan membandingkan kondisi sebelum dan sesudah tanpa menyimpan transaksi.</p>
              {:else if impactState === 'over'}
                <h2 class="text-lg font-semibold text-[#1F1F1F]">Pembelian ini melewati ruang fleksibel.</h2>
                <p class="mt-1 text-sm leading-6 text-[#68635F]">Selisihnya {rupiah(deficitAfter)}. Kalau tetap dilakukan, ada alokasi lain yang harus berubah.</p>
              {:else if impactState === 'all'}
                <h2 class="text-lg font-semibold text-[#1F1F1F]">Pembelian ini menghabiskan seluruh ruang fleksibel.</h2>
                <p class="mt-1 text-sm leading-6 text-[#68635F]">Setelahnya tidak ada sisa fleksibel sampai pemasukan berikutnya.</p>
              {:else}
                <h2 class="text-lg font-semibold text-[#1F1F1F]">Masih berada di dalam ruang fleksibel kalian.</h2>
                <p class="mt-1 text-sm leading-6 text-[#68635F]">Secara angka masih punya ruang. Cek juga cara memutuskannya menurut aturan kalian.</p>
              {/if}
            </div>
          </div>

          {#if impactState !== 'empty'}
            <div class="mt-5 grid gap-3 border-t border-black/5 pt-4 sm:grid-cols-2">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#77716D]">Angka Aman / minggu</p>
                <p class="mt-1 text-lg font-semibold text-[#1F1F1F]">{rupiah(safeWeeklyAfter)}</p>
                <p class="mt-1 text-[11px] text-[#8A8580]">Sebelumnya {rupiah(overview?.metrics?.safeWeekly || 0)}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#77716D]">Angka Aman / hari</p>
                <p class="mt-1 text-lg font-semibold text-[#1F1F1F]">{rupiah(safeDailyAfter)}</p>
                <p class="mt-1 text-[11px] text-[#8A8580]">Sebelumnya {rupiah(overview?.metrics?.safeDaily || 0)}</p>
              </div>
            </div>
          {/if}
        </section>

        <section class="uk-card p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]">
              {#if decisionState === 'notify'}<Bell size={19} />{:else}<MessageCircleMore size={19} />{/if}
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E1463D]">Cara memutuskannya</p>
              {#if decisionState === 'empty'}
                <h2 class="mt-1 text-base font-semibold text-[#1F1F1F]">Masukkan harga dulu.</h2>
              {:else if decisionState === 'unconfigured'}
                <h2 class="mt-1 text-base font-semibold text-[#1F1F1F]">Aturan keputusan belum dibuat.</h2>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Tentukan batas bebas, kasih tahu, dan ngobrol dulu.</p>
                <a href="/aturan-keputusan" class="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#E1463D]">Buat aturan <ArrowRight size={14} /></a>
              {:else if decisionState === 'free'}
                <h2 class="mt-1 text-base font-semibold text-[#1F1F1F]">Bebas diputuskan sendiri.</h2>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Nominal ini masih berada di dalam Batas Bebas.</p>
              {:else if decisionState === 'notify'}
                <h2 class="mt-1 text-base font-semibold text-[#1F1F1F]">Kasih tahu pasangan.</h2>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Nominal ini melewati Batas Bebas, tapi belum perlu diskusi penuh.</p>
              {:else}
                <h2 class="mt-1 text-base font-semibold text-[#1F1F1F]">Ngobrol dulu.</h2>
                <p class="mt-1 text-xs leading-5 text-[#77716D]">Nominal ini melewati Batas Kasih Tahu yang kalian sepakati.</p>
              {/if}
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</AppShell>
