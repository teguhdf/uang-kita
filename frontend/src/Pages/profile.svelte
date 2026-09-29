<script>
    import { router } from "@inertiajs/svelte";
    import {
        Camera,
        CheckCircle2,
        CircleAlert,
        KeyRound,
        LoaderCircle,
        LockKeyhole,
        LogOut,
        Mail,
        Phone,
        Save,
        ShieldCheck,
        UserRound,
    } from "lucide-svelte";
    import AppShell from "../Components/UangKita/AppShell.svelte";
    import { Toast } from "../Components/helper";

    let { flash, user } = $props();

    let current_password = $state("");
    let new_password = $state("");
    let confirm_password = $state("");
    let profileLoading = $state(false);
    let passwordLoading = $state(false);
    let avatarLoading = $state(false);
    let previewUrl = $state(user?.avatar || null);

    let formName = $state("");
    let formEmail = $state("");
    let formPhone = $state("");

    $effect(() => {
        if (user?.name !== undefined) formName = user.name || "";
        if (user?.email !== undefined) formEmail = user.email || "";
        if (user?.phone !== undefined) formPhone = user.phone || "";
        if (user?.avatar && !avatarLoading) previewUrl = user.avatar;
    });

    function initials(name) {
        if (!name) return "U";
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");
    }

    function handleAvatarChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        avatarLoading = true;

        fetch("/api/upload/image", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.success || !data.data) {
                    throw new Error(data.error || "Gagal mengunggah foto profil");
                }

                const avatarUrl = data.data.url;
                router.post(
                    "/change-profile",
                    {
                        name: formName,
                        email: formEmail,
                        phone: formPhone,
                        avatar: avatarUrl,
                    },
                    {
                        preserveScroll: true,
                        onFinish: () => {
                            avatarLoading = false;
                            previewUrl = avatarUrl + "?v=" + Date.now();
                            user.avatar = avatarUrl;
                        },
                    },
                );
            })
            .catch((error) => {
                avatarLoading = false;
                Toast(error?.message || "Gagal mengunggah foto profil", "error");
            });
    }

    function changeProfile() {
        router.post(
            "/change-profile",
            {
                name: formName,
                email: formEmail,
                phone: formPhone,
                avatar: user?.avatar || null,
            },
            {
                preserveScroll: true,
                onStart: () => (profileLoading = true),
                onFinish: () => (profileLoading = false),
            },
        );
    }

    function changePassword() {
        if (new_password !== confirm_password) {
            Toast("Kata sandi baru belum sama", "error");
            return;
        }

        if (!current_password || !new_password || !confirm_password) {
            Toast("Isi semua kolom kata sandi terlebih dulu", "error");
            return;
        }

        router.post(
            "/auth/change-password",
            {
                current_password,
                new_password,
                confirm_password,
            },
            {
                preserveScroll: true,
                onStart: () => (passwordLoading = true),
                onFinish: () => {
                    passwordLoading = false;
                    current_password = "";
                    new_password = "";
                    confirm_password = "";
                },
            },
        );
    }

    function logout() {
        router.post("/logout");
    }
</script>

<svelte:head>
    <title>Profil · UANG KITA</title>
    <meta name="description" content="Kelola profil dan keamanan akun UANG KITA." />
</svelte:head>

<AppShell active="profile">
    <div class="mx-auto max-w-4xl">
        <section class="mb-5 sm:mb-7">
            <p class="text-xs font-semibold text-[#E1463D]">Akun kamu</p>
            <h1 class="mt-1.5 text-[28px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#1F1F1F] sm:text-4xl">
                Profil & keamanan
            </h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-[#6E6965]">
                Kelola informasi akun yang dipakai untuk masuk dan menjaga ruang UANG KITA kalian tetap aman.
            </p>
        </section>

        {#if flash?.error}
            <div class="mb-4 flex items-start gap-3 rounded-2xl border border-[#F1D3CF] bg-[#FFF4F2] p-4 text-[#9A4038]">
                <CircleAlert class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
                <p class="text-sm leading-5">{flash.error}</p>
            </div>
        {/if}

        {#if flash?.success}
            <div class="mb-4 flex items-start gap-3 rounded-2xl border border-[#DDE8D9] bg-[#F4F8F2] p-4 text-[#486043]">
                <CheckCircle2 class="mt-0.5 shrink-0" size={18} strokeWidth={1.8} />
                <p class="text-sm leading-5">{flash.success}</p>
            </div>
        {/if}

        <section class="uk-card mb-4 p-5 sm:p-6">
            <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div class="relative w-fit shrink-0">
                    <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[24px] bg-[#F4F1EE] text-2xl font-bold text-[#1F1F1F] ring-1 ring-[#EDE8E4] sm:h-28 sm:w-28">
                        {#if previewUrl}
                            <img src={previewUrl} alt="Foto profil" class="h-full w-full object-cover" />
                        {:else}
                            {initials(user?.name)}
                        {/if}
                    </div>
                    <label class="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#E1463D] text-white shadow-[0_8px_20px_rgba(225,70,61,0.25)] transition hover:bg-[#C9362E]" aria-label="Ubah foto profil">
                        {#if avatarLoading}
                            <LoaderCircle class="animate-spin" size={18} />
                        {:else}
                            <Camera size={18} />
                        {/if}
                        <input type="file" accept="image/*" onchange={handleAvatarChange} class="hidden" disabled={avatarLoading} />
                    </label>
                </div>

                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="truncate text-xl font-semibold tracking-[-0.03em] text-[#1F1F1F] sm:text-2xl">{user?.name || "Pengguna"}</h2>
                        {#if user?.is_verified}
                            <span class="inline-flex items-center gap-1 rounded-full bg-[#EEF7F0] px-2.5 py-1 text-[10px] font-semibold text-[#4D7D57]">
                                <ShieldCheck size={12} /> Terverifikasi
                            </span>
                        {/if}
                    </div>
                    <p class="mt-1 truncate text-sm text-[#77716D]">{user?.email || ""}</p>
                    <p class="mt-3 max-w-lg text-xs leading-5 text-[#8A8580]">
                        Foto profil hanya membantu kalian mengenali akun. Data finansial tetap berada di ruang UANG KITA dan tidak ditampilkan di profil publik.
                    </p>
                </div>
            </div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
            <section class="uk-card p-5 sm:p-6">
                <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#E1463D]">
                        <UserRound size={19} />
                    </div>
                    <div>
                        <h2 class="text-base font-semibold tracking-[-0.02em] text-[#1F1F1F]">Informasi akun</h2>
                        <p class="mt-1 text-xs leading-5 text-[#817C77]">Nama, email, dan nomor HP yang terhubung ke akun ini.</p>
                    </div>
                </div>

                <form class="mt-5 space-y-4" onsubmit={(event) => { event.preventDefault(); changeProfile(); }}>
                    <div>
                        <label for="name" class="mb-2 block text-sm font-medium text-[#3F3B38]">Nama</label>
                        <div class="relative">
                            <UserRound class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958F]" size={18} />
                            <input id="name" type="text" bind:value={formName} required class="w-full rounded-2xl border border-[#E4DFDB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F1F1F] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E1463D] focus:ring-4 focus:ring-[#E1463D]/10" placeholder="Nama lengkap" />
                        </div>
                    </div>

                    <div>
                        <label for="email" class="mb-2 block text-sm font-medium text-[#3F3B38]">Email</label>
                        <div class="relative">
                            <Mail class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958F]" size={18} />
                            <input id="email" type="email" bind:value={formEmail} required class="w-full rounded-2xl border border-[#E4DFDB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F1F1F] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E1463D] focus:ring-4 focus:ring-[#E1463D]/10" placeholder="nama@email.com" />
                        </div>
                    </div>

                    <div>
                        <label for="phone" class="mb-2 block text-sm font-medium text-[#3F3B38]">Nomor HP</label>
                        <div class="relative">
                            <Phone class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958F]" size={18} />
                            <input id="phone" type="text" bind:value={formPhone} class="w-full rounded-2xl border border-[#E4DFDB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F1F1F] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E1463D] focus:ring-4 focus:ring-[#E1463D]/10" placeholder="08xxxxxxxxxx" />
                        </div>
                    </div>

                    <button type="submit" disabled={profileLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E1463D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C9362E] focus:outline-none focus:ring-4 focus:ring-[#E1463D]/15 disabled:cursor-not-allowed disabled:opacity-60">
                        {#if profileLoading}
                            <LoaderCircle class="animate-spin" size={18} /> Menyimpan...
                        {:else}
                            <Save size={17} /> Simpan perubahan
                        {/if}
                    </button>
                </form>
            </section>

            <section class="uk-card p-5 sm:p-6">
                <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7EA] text-[#B8791D]">
                        <KeyRound size={19} />
                    </div>
                    <div>
                        <h2 class="text-base font-semibold tracking-[-0.02em] text-[#1F1F1F]">Keamanan akun</h2>
                        <p class="mt-1 text-xs leading-5 text-[#817C77]">Ganti kata sandi tanpa mengubah data UANG KITA yang sudah tersimpan.</p>
                    </div>
                </div>

                <form class="mt-5 space-y-4" onsubmit={(event) => { event.preventDefault(); changePassword(); }}>
                    <div>
                        <label for="current_password" class="mb-2 block text-sm font-medium text-[#3F3B38]">Kata sandi saat ini</label>
                        <div class="relative">
                            <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958F]" size={18} />
                            <input id="current_password" type="password" bind:value={current_password} autocomplete="current-password" class="w-full rounded-2xl border border-[#E4DFDB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F1F1F] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E1463D] focus:ring-4 focus:ring-[#E1463D]/10" placeholder="Masukkan kata sandi saat ini" />
                        </div>
                    </div>

                    <div>
                        <label for="new_password" class="mb-2 block text-sm font-medium text-[#3F3B38]">Kata sandi baru</label>
                        <div class="relative">
                            <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958F]" size={18} />
                            <input id="new_password" type="password" bind:value={new_password} autocomplete="new-password" class="w-full rounded-2xl border border-[#E4DFDB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F1F1F] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E1463D] focus:ring-4 focus:ring-[#E1463D]/10" placeholder="Buat kata sandi baru" />
                        </div>
                    </div>

                    <div>
                        <label for="confirm_password" class="mb-2 block text-sm font-medium text-[#3F3B38]">Ulangi kata sandi baru</label>
                        <div class="relative">
                            <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9B958F]" size={18} />
                            <input id="confirm_password" type="password" bind:value={confirm_password} autocomplete="new-password" class="w-full rounded-2xl border border-[#E4DFDB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F1F1F] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E1463D] focus:ring-4 focus:ring-[#E1463D]/10" placeholder="Ulangi kata sandi baru" />
                        </div>
                    </div>

                    <button type="submit" disabled={passwordLoading} class="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E4DFDB] bg-white px-5 py-3.5 text-sm font-semibold text-[#1F1F1F] transition hover:border-[#D5CEC9] hover:bg-[#FAFAF8] focus:outline-none focus:ring-4 focus:ring-[#E1463D]/10 disabled:cursor-not-allowed disabled:opacity-60">
                        {#if passwordLoading}
                            <LoaderCircle class="animate-spin" size={18} /> Memperbarui...
                        {:else}
                            <ShieldCheck size={17} /> Perbarui kata sandi
                        {/if}
                    </button>
                </form>
            </section>
        </div>

        <section class="mt-4 rounded-[22px] border border-[#F0ECE8] bg-[#FAFAF8] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
            <div>
                <p class="text-sm font-semibold text-[#1F1F1F]">Keluar dari akun</p>
                <p class="mt-1 text-xs leading-5 text-[#817C77]">Data tidak dihapus. Kamu bisa masuk lagi kapan saja.</p>
            </div>
            <button type="button" on:click={logout} class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#A33D36] transition hover:bg-[#FFF1EF] sm:mt-0 sm:w-auto">
                <LogOut size={17} /> Keluar
            </button>
        </section>
    </div>
</AppShell>
