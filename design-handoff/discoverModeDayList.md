<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XIXA: Brutalist Day List v1</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:ital,wght@0,400;0,600;1,400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        zinc: {
                            300: "#D4D4D8",
                            400: "#A1A1AA",
                            500: "#71717A",
                            800: "#27272A",
                            900: "#18181B",
                            950: "#09090B",
                        },
                        stone: {
                            50: "#FAFAF9",
                            100: "#F5F5F4",
                            200: "#E7E5E4",
                            300: "#D6D3D1",
                        },
                        travertine: "#F6F5F2",
                        emerald: {
                            500: "#10B981"
                        }
                    },
                    fontFamily: {
                        sans: ["Inter", "sans-serif"],
                        serif: ["Playfair Display", "serif"],
                    },
                    borderRadius: {
                        'sm': '2px',
                    }
                }
            }
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
  </head>
<body class="bg-stone-50 text-zinc-950 h-screen w-full overflow-hidden relative font-sans antialiased flex flex-col">
<div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
<div class="absolute inset-0 bg-stone-50"></div>
</div>
<div class="relative z-20 flex-none bg-stone-50/95 backdrop-blur-sm border-b border-stone-200/50 pb-4">
<div class="pt-14 px-6 flex flex-col items-start space-y-4">
<div class="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
<div class="bg-white border border-zinc-300 p-0.5 rounded-sm flex pointer-events-auto">
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-sm text-xs font-medium transition-all bg-zinc-950 text-white border border-zinc-950">
<span>⛱️</span>
<span>DAY</span>
</button>
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-sm text-xs font-medium transition-all bg-transparent text-zinc-500 border border-transparent hover:bg-stone-100">
<span class="opacity-70">🪩</span>
<span>NIGHT</span>
</button>
</div>
</div>
<div class="flex justify-between items-start w-full relative z-20 pt-8">
<div>
<h1 class="font-serif text-4xl text-zinc-950 tracking-tight">XIXA</h1>
<div class="flex items-center space-x-2 mt-1">
<div class="w-1.5 h-1.5 rounded-sm bg-emerald-500 border border-zinc-950 animate-pulse"></div>
<p class="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Albanian Riviera</p>
</div>
</div>
<div class="flex flex-col items-end space-y-3 pt-0">
<div class="flex space-x-2">
<button class="w-10 h-10 flex items-center justify-center rounded-sm border border-zinc-300 bg-white hover:bg-stone-100 transition-all group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-950 text-xl transition-colors">search</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-sm border border-zinc-300 bg-white hover:bg-stone-100 transition-all group">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-950 text-xl transition-colors">notifications</span>
</button>
</div>
<div class="flex items-center bg-white border border-zinc-300 rounded-sm p-0.5">
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-bold text-white bg-zinc-950 rounded-sm border border-zinc-950 mr-1">
<span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
<span>List</span>
</button>
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-medium text-zinc-500 hover:text-zinc-900 transition-colors border-l border-zinc-200 pl-3">
<span class="material-symbols-outlined text-[16px]">map</span>
<span>Map</span>
</button>
</div>
</div>
</div>
<div class="flex space-x-3 overflow-x-auto no-scrollbar w-full pb-2 pt-2 pl-0.5 -mx-6 px-6">
<button class="whitespace-nowrap px-5 py-2 rounded-sm bg-zinc-900 text-white border border-zinc-900 text-xs font-medium tracking-wide transform active:scale-95 transition-all">
                    ALL VENUES
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-sm bg-white border border-zinc-300 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 text-xs font-medium tracking-wide transition-all">
                    BEACH CLUBS
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-sm bg-white border border-zinc-300 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 text-xs font-medium tracking-wide transition-all">
                    BOATS
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-sm bg-white border border-zinc-300 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 text-xs font-medium tracking-wide transition-all">
                    DINING
                </button>
</div>
</div>
</div>
<div class="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-0 bg-stone-50">
<div class="px-6 py-6 space-y-6 pb-24">
<div class="group relative bg-white border border-zinc-300 overflow-hidden rounded-sm">
<div class="relative h-64 w-full overflow-hidden">
<img alt="Havana Beach Club" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[10%] group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALDwfp9s8MfPqZXKfj92l9g1wn_XHjUEUef4V9Mmf8sR0tg-2PXPqYPLO6zNORPSdfu28hURca4V3uIGgftW7fQ6pe3rlTELKvxdUN4GaC0TZ1bHVZ6aLOgjyTpty_FF6SLfEufOGMOIasU3NP8yXZY8JtJWV5WE4ByH1I6l5PgIgfqfQbdIqKIh3NXMlBvsPc7cAS8Tm2rl8DCeYABnek5nAIQ0NH9gAm9lIeDVl16RDpENi4yJ3nnnznoxPFfj8yR7kUhCttk9cF"/>
<div class="absolute top-3 left-3 flex items-center space-x-2">
<span class="px-2.5 py-1 bg-emerald-500 border border-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-none">Available</span>
</div>
<div class="absolute top-3 right-3">
<button class="w-8 h-8 rounded-sm bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
<span class="material-symbols-outlined text-white text-[18px]">favorite</span>
</button>
</div>
<div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
<div class="absolute bottom-3 left-3 text-white">
<div class="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-medium opacity-90">
<span class="material-symbols-outlined text-[14px]">location_on</span>
<span>Dhërmi, Albania</span>
</div>
</div>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="font-serif text-2xl text-zinc-950">Havana Beach Club</h3>
<div class="flex items-center space-x-0.5">
<span class="material-symbols-outlined text-zinc-950 text-[14px] fill-current">star</span>
<span class="text-xs font-bold text-zinc-950">4.9</span>
<span class="text-[10px] text-zinc-400">(128)</span>
</div>
</div>
<p class="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4 font-sans">
                        The crown jewel of Dhërmi. Experience world-class service, pristine sands, and the most exclusive sunset parties on the Riviera.
                    </p>
<div class="grid grid-cols-2 gap-4 mb-5 border-t border-b border-zinc-100 py-3">
<div class="flex flex-col">
<span class="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Min. Spend</span>
<span class="text-sm font-medium text-zinc-900">€200 / bed</span>
</div>
<div class="flex flex-col">
<span class="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Vibe</span>
<span class="text-sm font-medium text-zinc-900">High Energy</span>
</div>
</div>
<div class="flex items-center space-x-3 pt-1">
<button class="flex-1 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-zinc-800 transition-colors border border-zinc-950 rounded-sm">
                            Reserve
                        </button>
<button class="w-10 h-10 flex items-center justify-center border border-zinc-300 hover:border-zinc-950 transition-colors bg-white rounded-sm">
<span class="material-symbols-outlined text-zinc-950 text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
<div class="group relative bg-white border border-zinc-300 overflow-hidden rounded-sm">
<div class="relative h-64 w-full overflow-hidden">
<img alt="Pepperon The Beach" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[10%] group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXDCVlSwhzePaSoQ_9MA_btAeAei0TzntqgaBOkz-aKTb3_xIFZABJPOGPBszYzmZ5zThOVP-4fh0cXyUYD2lgYajEiN3mudtHCFCLX8giIwVzCi8PM_rixx7QvKboHfvcVK6KHmGibMgpjkZhuOtbmZYoNSjWL5cuHrvYvbNwAVSFaNM5PkPMqfWDvSf5rxoPTMI3Njazn5GsQHFBllHuEkd-Moj33boc9NiqBCfzHsAuX1YeDa3U0sNkmUHGk5ljvVMeeO6JPcl7"/>
<div class="absolute top-3 left-3 flex items-center space-x-2">
<span class="px-2.5 py-1 bg-white border border-zinc-300 text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-sm">Few Left</span>
</div>
<div class="absolute top-3 right-3">
<button class="w-8 h-8 rounded-sm bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
<span class="material-symbols-outlined text-white text-[18px]">favorite</span>
</button>
</div>
<div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
<div class="absolute bottom-3 left-3 text-white">
<div class="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-medium opacity-90">
<span class="material-symbols-outlined text-[14px]">location_on</span>
<span>Drymades, Albania</span>
</div>
</div>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="font-serif text-2xl text-zinc-950">Pepperon The Beach</h3>
<div class="flex items-center space-x-0.5">
<span class="material-symbols-outlined text-zinc-950 text-[14px] fill-current">star</span>
<span class="text-xs font-bold text-zinc-950">4.7</span>
<span class="text-[10px] text-zinc-400">(84)</span>
</div>
</div>
<p class="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4 font-sans">
                        A bohemian paradise offering exquisite seafood dining and laid-back lounge music by the azure sea.
                    </p>
<div class="grid grid-cols-2 gap-4 mb-5 border-t border-b border-zinc-100 py-3">
<div class="flex flex-col">
<span class="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Min. Spend</span>
<span class="text-sm font-medium text-zinc-900">€150 / bed</span>
</div>
<div class="flex flex-col">
<span class="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Vibe</span>
<span class="text-sm font-medium text-zinc-900">Chill &amp; Chic</span>
</div>
</div>
<div class="flex items-center space-x-3 pt-1">
<button class="flex-1 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-zinc-800 transition-colors border border-zinc-950 rounded-sm">
                            Reserve
                        </button>
<button class="w-10 h-10 flex items-center justify-center border border-zinc-300 hover:border-zinc-950 transition-colors bg-white rounded-sm">
<span class="material-symbols-outlined text-zinc-950 text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
<div class="group relative bg-white border border-zinc-300 overflow-hidden rounded-sm">
<div class="relative h-64 w-full overflow-hidden">
<img alt="Folie Marine" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[10%] group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk4uHwH134688_9Vpp7Lr8aROXcr8j2s4pl36Ve_O2d0yO0PZ_qCmVWBr8Vg4Ns0dFVFTDmi-pbbQDZkJDpBychU-5TWtUBEDQ3awNoFLePHbqCrzbQZ_pg4cT5949mxe4O2-ts93ehQr6rIHJe2hX_T7kDvhSESQJCsLsPKcz491ddbhjaGI82Ct9Ag5eHxE9rpLC2EgaSu08yw0ERIBLdBp4O-qZGvHdG13YQ9mEemdjO9OGjKBUA0T39Qiw6VVjtTQazlb5BD87"/>
<div class="absolute top-3 left-3 flex items-center space-x-2">
<span class="px-2.5 py-1 bg-emerald-500 border border-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-none">Available</span>
</div>
<div class="absolute top-3 right-3">
<button class="w-8 h-8 rounded-sm bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
<span class="material-symbols-outlined text-white text-[18px]">favorite</span>
</button>
</div>
<div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
<div class="absolute bottom-3 left-3 text-white">
<div class="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-medium opacity-90">
<span class="material-symbols-outlined text-[14px]">location_on</span>
<span>Jale, Albania</span>
</div>
</div>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h3 class="font-serif text-2xl text-zinc-950">Folie Marine</h3>
<div class="flex items-center space-x-0.5">
<span class="material-symbols-outlined text-zinc-950 text-[14px] fill-current">star</span>
<span class="text-xs font-bold text-zinc-950">4.8</span>
<span class="text-[10px] text-zinc-400">(210)</span>
</div>
</div>
<p class="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4 font-sans">
                       The ultimate party destination. Crystal clear waters meet high-octane entertainment and luxury yacht docking.
                    </p>
<div class="grid grid-cols-2 gap-4 mb-5 border-t border-b border-zinc-100 py-3">
<div class="flex flex-col">
<span class="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Min. Spend</span>
<span class="text-sm font-medium text-zinc-900">€300 / bed</span>
</div>
<div class="flex flex-col">
<span class="text-[10px] uppercase text-zinc-400 tracking-wider mb-0.5">Vibe</span>
<span class="text-sm font-medium text-zinc-900">Party</span>
</div>
</div>
<div class="flex items-center space-x-3 pt-1">
<button class="flex-1 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-zinc-800 transition-colors border border-zinc-950 rounded-sm">
                            Reserve
                        </button>
<button class="w-10 h-10 flex items-center justify-center border border-zinc-300 hover:border-zinc-950 transition-colors bg-white rounded-sm">
<span class="material-symbols-outlined text-zinc-950 text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
</div>
<div class="flex-none z-30 bg-travertine border-t border-zinc-200">
<nav class="w-full">
<div class="flex items-center justify-around py-4 pb-8">
<button class="flex flex-col items-center space-y-1 group w-1/4">
<span class="material-symbols-outlined text-zinc-950 text-[26px]">explore</span>
<span class="text-[10px] font-bold text-zinc-950 tracking-wide">DISCOVER</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 opacity-60 hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-zinc-950 text-[24px]">favorite</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-950 tracking-wide">SAVED</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 opacity-60 hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-zinc-950 text-[24px]">confirmation_number</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-950 tracking-wide">BOOKINGS</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 opacity-60 hover:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-zinc-950 text-[24px]">person</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-950 tracking-wide">PROFILE</span>
</button>
</div>
</nav>
</div>

</body></html>