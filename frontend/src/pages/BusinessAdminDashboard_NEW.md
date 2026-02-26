<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Elite Riviera Admin Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&amp;family=Inter:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#3B82F6",
                        "background-light": "#F3F4F6",
                        "background-dark": "#09090b", // Zinc-950
                        "card-light": "#FFFFFF",
                        "card-dark": "#18181b", // Zinc-900
                        "border-light": "#E5E7EB",
                        "border-dark": "#27272a", // Zinc-800
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    boxShadow: {
                        'glow': '0 0 10px rgba(59, 130, 246, 0.1)',
                    }
                },
            },
        };
    </script>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans min-h-screen antialiased selection:bg-primary selection:text-white transition-colors duration-200">
<div class="max-w-md mx-auto min-h-screen relative flex flex-col pb-20">
<header class="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-5 py-4">
<div class="flex items-center justify-between">
<div>
<div class="flex items-center gap-2 mb-1">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
</span>
<span class="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">System Live</span>
</div>
<h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white font-sans">
                    Mirësevjen, [Emri]
                </h1>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Riviera OS Admin</p>
</div>
<div class="flex items-center gap-3">
<button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400" onclick="document.documentElement.classList.toggle('dark')">
<span class="material-symbols-outlined text-xl">dark_mode</span>
</button>
</div>
</div>
</header>
<nav class="sticky top-[85px] z-40 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark overflow-x-auto no-scrollbar">
<div class="flex px-4 min-w-full">
<a class="py-3 px-4 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap" href="#">
                Overview
            </a>
<a class="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors whitespace-nowrap" href="#">
                Staff
            </a>
<a class="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors whitespace-nowrap" href="#">
                Menu
            </a>
<a class="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors whitespace-nowrap" href="#">
                Venues
            </a>
<a class="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors whitespace-nowrap pr-8" href="#">
                QR Codes
            </a>
</div>
</nav>
<main class="flex-1 p-5 space-y-8">
<section>
<div class="flex items-baseline justify-between mb-4 pl-1">
<h2 class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 font-mono">
                    Business Overview
                </h2>
<span class="text-[10px] text-gray-400 font-mono">UPDATED NOW</span>
</div>
<div class="grid grid-cols-1 gap-4">
<div class="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm transition-all duration-300">
<div class="flex justify-between items-start">
<div>
<p class="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Total Revenue</p>
<p class="text-4xl font-extrabold mt-3 text-gray-900 dark:text-white font-mono tracking-tighter">€0</p>
</div>
<div class="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
<span class="material-symbols-outlined text-primary text-2xl">payments</span>
</div>
</div>
<div class="mt-4 flex items-center gap-2">
<div class="h-1 flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
<div class="h-full bg-primary w-[2%] rounded-full"></div>
</div>
<span class="text-[10px] font-mono text-gray-400">0%</span>
</div>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm">
<p class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Active Staff</p>
<div class="flex items-end justify-between mt-3">
<p class="text-2xl font-bold text-gray-900 dark:text-white font-mono">6</p>
<span class="material-symbols-outlined text-gray-300 dark:text-zinc-700 text-xl">groups</span>
</div>
</div>
<div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm">
<p class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Menu Items</p>
<div class="flex items-end justify-between mt-3">
<p class="text-2xl font-bold text-gray-900 dark:text-white font-mono">0</p>
<span class="material-symbols-outlined text-gray-300 dark:text-zinc-700 text-xl">restaurant_menu</span>
</div>
</div>
</div>
</div>
</section>
<section>
<h2 class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-4 font-mono pl-1">
                Quick Access
            </h2>
<div class="space-y-3">
<a class="block group relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:border-primary/30 transition-all duration-300" href="#">
<div class="flex items-center gap-4">
<div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-lg">
                            🍹
                        </div>
<div class="flex-1 min-w-0">
<h3 class="text-sm font-bold text-gray-900 dark:text-white font-sans group-hover:text-primary transition-colors">
                                Bar Display
                            </h3>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                                Kitchen Order Queue
                            </p>
</div>
<div class="text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-xl">chevron_right</span>
</div>
</div>
</a>
<a class="block group relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:border-primary/30 transition-all duration-300" href="#">
<div class="flex items-center gap-4">
<div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-lg">
                            🏖️
                        </div>
<div class="flex-1 min-w-0">
<h3 class="text-sm font-bold text-gray-900 dark:text-white font-sans group-hover:text-primary transition-colors">
                                Collector Dashboard
                            </h3>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                                Bookings &amp; Reservations
                            </p>
</div>
<div class="text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-xl">chevron_right</span>
</div>
</div>
</a>
<a class="block group relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:border-primary/30 transition-all duration-300" href="#">
<div class="flex items-center gap-4">
<div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-lg">
                            📱
                        </div>
<div class="flex-1 min-w-0">
<h3 class="text-sm font-bold text-gray-900 dark:text-white font-sans group-hover:text-primary transition-colors">
                                QR Code Generator
                            </h3>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                                Zone Management
                            </p>
</div>
<div class="text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-xl">chevron_right</span>
</div>
</div>
</a>
</div>
</section>
</main>
<div class="h-8"></div>
</div>
<div class="fixed bottom-6 right-6 z-50">
<button class="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-blue-600 active:scale-95 transition-all">
<span class="material-symbols-outlined text-2xl">add</span>
</button>
</div>
</body></html>