<script>
    import { page, router, inertia } from "@inertiajs/svelte";
    import {
        Home,
        WalletCards,
        MessageCircle,
        UsersRound,
        Settings,
        LogOut,
    } from "lucide-svelte";

    export let active = "home";

    let user = page.props.user;

    const navItems = [
        { key: "home", label: "Beranda", href: "/home", icon: Home, enabled: true },
        { key: "plan", label: "Rencana", href: "#", icon: WalletCards, enabled: false },
        { key: "decisions", label: "Keputusan", href: "#", icon: MessageCircle, enabled: false },
        { key: "couple", label: "Kita", href: "#", icon: UsersRound, enabled: false },
    ];

    function handleLogout() {
        router.post("/logout");
    }

    function initials(name) {
        if (!name) return "U";

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");
    }
</script>

<div class="min-h-screen bg-[#F7F3EE] text-[#24211E]" style="color-scheme: light;">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#E7DED4] bg-[#FBF8F4] lg:flex lg:flex-col">
        <div class="px-6 pb-5 pt-7">
            <a href="/home" use:inertia class="inline-flex items-end gap-2">
                <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9B6B62]">
                        Sedalam Ini.
                    </p>
                    <h1 class="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#24211E]">
                        UANG KITA
                    </h1>
                </div>
            </a>
            <p class="mt-3 max-w-[190px] text-xs leading-5 text-[#817970]">
                Lihat kondisi uang bersama. Sepakati batasnya. Bicarakan dengan lebih jernih.
            </p>
        </div>

        <nav class="flex-1 px-3 py-3">
            <p class="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A59A90]">
                Ruang kalian
            </p>

            <div class="space-y-1">
                {#each navItems as item}
                    {@const Icon = item.icon}
                    {#if item.enabled}
                        <a
                            href={item.href}
                            use:inertia
                            class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors {active === item.key
                                ? 'bg-[#EFE2DA] text-[#7B4038]'
                                : 'text-[#6F6760] hover:bg-[#F1EBE5] hover:text-[#24211E]'}"
                        >
                            <Icon size={19} strokeWidth={1.8} />
                            <span>{item.label}</span>
                        </a>
                    {:else}
                        <div class="flex cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-3 text-sm text-[#B0A69E]">
                            <Icon size={19} strokeWidth={1.8} />
                            <span>{item.label}</span>
                            <span class="ml-auto rounded-full bg-[#EFE9E3] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#9D938A]">
                                soon
                            </span>
                        </div>
                    {/if}
                {/each}
            </div>
        </nav>

        <div class="border-t border-[#E7DED4] p-4">
            <div class="rounded-2xl bg-[#F2ECE6] p-3">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7B4038] text-sm font-semibold text-white">
                        {initials(user?.name)}
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-[#2E2A27]">
                            {user?.name || "Pengguna"}
                        </p>
                        <p class="truncate text-xs text-[#8B8179]">
                            {user?.email || "Akun UANG KITA"}
                        </p>
                    </div>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2">
                    <a
                        href="/profile"
                        use:inertia
                        class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-medium text-[#5D554F] transition-colors hover:bg-[#FCFAF8]"
                    >
                        <Settings size={14} />
                        Profil
                    </a>
                    <button
                        type="button"
                        on:click={handleLogout}
                        class="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[#8C4B43] transition-colors hover:bg-[#EADFD9]"
                    >
                        <LogOut size={14} />
                        Keluar
                    </button>
                </div>
            </div>
        </div>
    </aside>

    <header class="sticky top-0 z-20 border-b border-[#E9E1D9] bg-[#FBF8F4]/95 backdrop-blur lg:hidden">
        <div class="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
            <div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9B6B62]">
                    Sedalam Ini.
                </p>
                <p class="mt-0.5 text-sm font-semibold tracking-[-0.02em]">UANG KITA</p>
            </div>

            <a
                href="/profile"
                use:inertia
                aria-label="Buka profil"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#7B4038] text-xs font-semibold text-white"
            >
                {initials(user?.name)}
            </a>
        </div>
    </header>

    <main class="lg:pl-64">
        <div class="mx-auto min-h-screen max-w-5xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
            <slot />
        </div>
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-[#E4DBD2] bg-[#FBF8F4]/96 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div class="mx-auto grid h-[72px] max-w-xl grid-cols-4 px-2">
            {#each navItems as item}
                {@const Icon = item.icon}
                {#if item.enabled}
                    <a
                        href={item.href}
                        use:inertia
                        class="flex flex-col items-center justify-center gap-1 text-[10px] font-medium {active === item.key
                            ? 'text-[#7B4038]'
                            : 'text-[#8C827A]'}"
                    >
                        <span class="flex h-8 w-10 items-center justify-center rounded-full {active === item.key ? 'bg-[#EFE2DA]' : ''}">
                            <Icon size={19} strokeWidth={1.8} />
                        </span>
                        {item.label}
                    </a>
                {:else}
                    <button
                        type="button"
                        disabled
                        class="flex cursor-not-allowed flex-col items-center justify-center gap-1 text-[10px] font-medium text-[#B3AAA2]"
                    >
                        <span class="flex h-8 w-10 items-center justify-center rounded-full">
                            <Icon size={19} strokeWidth={1.8} />
                        </span>
                        {item.label}
                    </button>
                {/if}
            {/each}
        </div>
    </nav>
</div>
