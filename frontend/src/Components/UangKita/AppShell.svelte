<script>
    import { page, router, inertia } from "@inertiajs/svelte";
    import {
        Home,
        CalendarDays,
        MessageCircle,
        UsersRound,
        Settings,
        LogOut,
        ChevronRight,
    } from "lucide-svelte";

    export let active = "home";

    let user = page.props.user;

    const navItems = [
        { key: "home", label: "Beranda", href: "/home", icon: Home },
        { key: "plan", label: "Rencana", href: "/onboarding", icon: CalendarDays },
        { key: "decisions", label: "Keputusan", href: "/aman-kalau-dibeli", icon: MessageCircle },
        { key: "couple", label: "Kita", href: "/aturan-keputusan", icon: UsersRound },
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

<div class="min-h-screen bg-white text-[#1F1F1F]" style="color-scheme: light;">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-[228px] border-r border-[#EEEAE6] bg-white lg:flex lg:flex-col">
        <div class="border-b border-[#F1EEEA] px-5 py-5">
            <a href="/home" use:inertia class="block" aria-label="UANG KITA beranda">
                <img src="/public/sedalam-ini-logo.svg" alt="Sedalam Ini. UANG KITA" class="h-auto w-[166px]" />
            </a>
        </div>

        <nav class="flex-1 px-3 py-4">
            <div class="space-y-1.5">
                {#each navItems as item}
                    {@const Icon = item.icon}
                    <a
                        href={item.href}
                        use:inertia
                        class="group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all {active === item.key
                            ? 'bg-[#FFF1EF] text-[#C9362E]'
                            : 'text-[#56514D] hover:bg-[#FAF8F6] hover:text-[#1F1F1F]'}"
                    >
                        <span class="flex h-8 w-8 items-center justify-center rounded-xl {active === item.key ? 'bg-white text-[#E1463D] shadow-sm' : 'text-[#6E6965]'}">
                            <Icon size={18} strokeWidth={1.85} />
                        </span>
                        <span>{item.label}</span>
                        {#if active === item.key}
                            <ChevronRight class="ml-auto" size={15} strokeWidth={2} />
                        {/if}
                    </a>
                {/each}
            </div>
        </nav>

        <div class="border-t border-[#F1EEEA] p-3">
            <a href="/profile" use:inertia class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#FAF8F6]">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1F1F1F] text-xs font-bold text-white">
                    {#if user?.avatar}
                        <img src={user.avatar} alt="Foto profil" class="h-full w-full object-cover" />
                    {:else}
                        {initials(user?.name)}
                    {/if}
                </div>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-[#1F1F1F]">{user?.name || "Pengguna"}</p>
                    <p class="truncate text-[11px] text-[#817C77]">{user?.email || "Akun UANG KITA"}</p>
                </div>
            </a>

            <div class="mt-1 grid grid-cols-2 gap-1.5">
                <a href="/profile" use:inertia class="inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#625D59] transition hover:bg-[#FAF8F6]">
                    <Settings size={14} /> Profil
                </a>
                <button type="button" on:click={handleLogout} class="inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#9E3A33] transition hover:bg-[#FFF1EF]">
                    <LogOut size={14} /> Keluar
                </button>
            </div>
        </div>
    </aside>

    <header class="sticky top-0 z-20 border-b border-[#EEEAE6] bg-white/96 backdrop-blur lg:hidden">
        <div class="mx-auto flex h-[62px] max-w-xl items-center justify-between px-4">
            <a href="/home" use:inertia class="flex items-center" aria-label="UANG KITA beranda">
                <img src="/public/sedalam-ini-logo.svg" alt="Sedalam Ini. UANG KITA" class="h-auto w-[138px]" />
            </a>
            <a href="/profile" use:inertia aria-label="Buka profil" class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#1F1F1F] text-xs font-bold text-white">
                {#if user?.avatar}
                    <img src={user.avatar} alt="Foto profil" class="h-full w-full object-cover" />
                {:else}
                    {initials(user?.name)}
                {/if}
            </a>
        </div>
    </header>

    <main class="bg-white lg:pl-[228px]">
        <div class="mx-auto min-h-screen max-w-[1120px] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12 lg:pt-8 xl:px-10">
            <slot />
        </div>
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-[#EDE9E5] bg-white/98 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(31,31,31,0.045)] backdrop-blur lg:hidden">
        <div class="mx-auto grid h-[66px] max-w-xl grid-cols-4 px-2">
            {#each navItems as item}
                {@const Icon = item.icon}
                <a
                    href={item.href}
                    use:inertia
                    class="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition {active === item.key ? 'text-[#E1463D]' : 'text-[#77716D]'}"
                >
                    <span class="flex h-8 w-10 items-center justify-center rounded-xl {active === item.key ? 'bg-[#FFF1EF]' : ''}">
                        <Icon size={19} strokeWidth={active === item.key ? 2 : 1.7} />
                    </span>
                    {item.label}
                </a>
            {/each}
        </div>
    </nav>
</div>
