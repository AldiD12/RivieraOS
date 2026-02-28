<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XIXA: Brutalist Night Radar UI</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:ital,wght@0,400;0,600;1,400&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        zinc: {
                            400: "#A1A1AA",
                            500: "#71717A",
                            800: "#27272A",
                            850: "#1f1f22",
                            900: "#18181B",
                            950: "#09090B",
                        },
                        xixa: {
                            green: "#10FF88",
                        },
                        amber: {
                            500: "#F59E0B",
                        }
                    },
                    fontFamily: {
                        sans: ["Inter", "sans-serif"],
                        serif: ["Playfair Display", "serif"],
                        mono: ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {
                        'sm': '2px',
                    }
                }
            }
        };
    </script>
<style type="text/tailwindcss">
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .bg-gradient-mesh {
            background-image: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,0.05) 0, transparent 50%);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-zinc-950 text-white min-h-[884px] h-screen w-full overflow-hidden relative font-sans antialiased bg-gradient-mesh">
<div class="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
<div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-xixa-green/5 blur-[120px]"></div>
</div>
<div class="absolute top-0 left-0 right-0 z-30">
<div class="pt-14 px-6 flex flex-col items-start space-y-4 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-900 pb-4 relative">
<div class="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
<div class="bg-zinc-900 border border-zinc-800 p-1 rounded-sm flex pointer-events-auto">
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-sm text-[10px] font-bold tracking-widest transition-all bg-transparent text-zinc-500">
<span>DAY</span>
</button>
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-sm text-[10px] font-bold tracking-widest transition-all bg-zinc-100 text-black">
<span>NIGHT</span>
</button>
</div>
</div>
<div class="flex justify-between items-start w-full relative z-20 pt-8">
<div>
<h1 class="font-serif text-4xl text-white tracking-tighter uppercase italic">XIXA</h1>
<div class="flex items-center space-x-2 mt-1">
<div class="w-1.5 h-1.5 bg-xixa-green"></div>
<p class="text-[9px] font-mono tracking-[0.3em] text-zinc-500 uppercase">Albanian Riviera / Radar</p>
</div>
</div>
<div class="flex flex-col items-end space-y-3">
<button class="w-10 h-10 flex items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-all">
<span class="material-symbols-outlined text-zinc-400 text-xl">notifications</span>
</button>
<div class="flex items-center bg-zinc-900 border border-zinc-800 rounded-sm p-1">
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-bold text-black bg-zinc-100 rounded-sm">
<span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
<span>List</span>
</button>
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 transition-colors pl-3">
<span class="material-symbols-outlined text-[16px]">map</span>
<span>Map</span>
</button>
</div>
</div>
</div>
<div class="flex space-x-2 overflow-x-auto no-scrollbar w-full pt-4">
<button class="whitespace-nowrap px-4 py-2 rounded-sm bg-zinc-100 text-black text-[10px] font-bold tracking-widest uppercase">
                ALL VENUES
            </button>
<button class="whitespace-nowrap px-4 py-2 rounded-sm bg-transparent border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                NIGHTCLUBS
            </button>
<button class="whitespace-nowrap px-4 py-2 rounded-sm bg-transparent border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                LOUNGES
            </button>
<button class="whitespace-nowrap px-4 py-2 rounded-sm bg-transparent border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all">
                FINE DINING
            </button>
</div>
</div>
</div>
<div class="absolute inset-0 pt-[250px] pb-[100px] overflow-y-auto no-scrollbar z-10 px-6 space-y-8">
<div class="relative w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group">
<div class="h-56 w-full bg-zinc-900 relative">
<div class="absolute top-0 left-0 z-20 bg-zinc-950 border-r border-b border-zinc-800 px-3 py-1.5 flex items-center space-x-2">
<span class="w-1.5 h-1.5 bg-xixa-green"></span>
<span class="text-[10px] font-mono font-bold text-white tracking-[0.2em] uppercase">LIVE NOW</span>
</div>
<img alt="Club" class="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdsNUwvantSai_8sGaZASzCDN0Cjoc7PbDzUa7g-7jBhXj02l2PW6CZuN6286H1UdusDsO6_CN4ZE2WDOYXABG7LhZ_dBThRau29O0F42UKSNuL-oEQ-U_yr8nSO_HMnK-vZrAcc11VGLR2mjTJummAo9WyQrrpT4vYaZx4H3K7Gef70ENk3x0k_R5ajlPO3IxD1PqesUUBLrNhuBMwvG6mnQJC8IXK_0ZSieNzmHPt8nUiaJGAMem_ZBWxNnU1-kTHGNAkzoGkUKA"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h2 class="text-2xl font-serif text-white uppercase tracking-tight">Havana Beach</h2>
<span class="text-xixa-green text-[10px] font-mono mt-2 tracking-widest">0.8KM_PROXIMITY</span>
</div>
<div class="flex items-center space-x-3 text-[10px] font-mono text-zinc-500 mb-6 uppercase tracking-wider">
<span class="flex items-center"><span class="material-symbols-outlined text-[12px] mr-1">music_note</span>Deep House</span>
<span class="w-1 h-1 bg-zinc-800"></span>
<span>Tier: $$$$</span>
</div>
<div class="flex items-center justify-between pt-4 border-t border-zinc-800">
<div class="flex -space-x-1">
<div class="w-8 h-8 rounded-sm border border-zinc-950 bg-zinc-800 flex items-center justify-center text-[9px] font-mono text-white">JD</div>
<div class="w-8 h-8 rounded-sm border border-zinc-950 bg-zinc-700 flex items-center justify-center text-[9px] font-mono text-white">AL</div>
<div class="w-8 h-8 rounded-sm border border-zinc-950 bg-zinc-950 flex items-center justify-center text-[9px] font-mono text-zinc-500">+12</div>
</div>
<button class="px-5 py-2.5 bg-zinc-100 rounded-sm text-[10px] font-bold text-black tracking-widest uppercase hover:bg-xixa-green transition-all flex items-center space-x-2">
<span>REQUEST VIP</span>
<span class="material-symbols-outlined text-[16px]">arrow_right_alt</span>
</button>
</div>
</div>
</div>
<div class="relative w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group">
<div class="h-56 w-full bg-zinc-900 relative">
<div class="absolute top-0 left-0 z-20 bg-zinc-900 border-r border-b border-zinc-800 px-3 py-1.5 flex items-center space-x-2">
<span class="w-1.5 h-1.5 bg-amber-500"></span>
<span class="text-[10px] font-mono font-bold text-amber-500 tracking-widest uppercase">FILLING FAST</span>
</div>
<img alt="Club" class="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZm43vipo-cMlFIklDGaC-TJewWTASiHUmmuheN-7FdmIABYmsRlpnNfSk1sVhw1B3mS1w0dVsgThHAiOB_bfIlgJcPy0Ke3HiTLOhv3ppM9EMlsS1KpHl40S_Wy_yXkHyXdOJ8VPGdcIYy74Il-onQgzVpC0YEaAGKV9uBPT-5YKSAA9On_GhWeJALyFJwV2XSaeH9k_1hTRL2c3yoAecUOSA40f1EcCW5ljU5ZdiUNm6IgXZMw2a2TDZK1Hg3yx6JcR1tInl0Ih-"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h2 class="text-2xl font-serif text-white uppercase tracking-tight">Folie Marine</h2>
<span class="text-zinc-500 text-[10px] font-mono mt-2 tracking-widest">2.4KM_PROXIMITY</span>
</div>
<div class="flex items-center space-x-3 text-[10px] font-mono text-zinc-500 mb-6 uppercase tracking-wider">
<span class="flex items-center"><span class="material-symbols-outlined text-[12px] mr-1">local_bar</span>Cocktail Lounge</span>
<span class="w-1 h-1 bg-zinc-800"></span>
<span>Tier: $$$</span>
</div>
<div class="flex items-center justify-between pt-4 border-t border-zinc-800">
<div class="flex -space-x-1">
<div class="w-8 h-8 rounded-sm border border-zinc-950 bg-zinc-800 flex items-center justify-center text-[9px] font-mono text-white">MK</div>
<div class="w-8 h-8 rounded-sm border border-zinc-950 bg-zinc-950 flex items-center justify-center text-[9px] font-mono text-zinc-500">+4</div>
</div>
<button class="px-5 py-2.5 bg-transparent border border-zinc-800 rounded-sm text-[10px] font-bold text-white tracking-widest uppercase hover:border-zinc-100 transition-all">
<span>RESERVE</span>
</button>
</div>
</div>
</div>
<div class="relative w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group mb-24">
<div class="h-56 w-full bg-zinc-900 relative">
<img alt="Dining" class="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlu3YXU0atMGaPAwCGpeLdX8tt3ekQFSZ7U4_NfYX1HOg_vJlYqRxXLnVs-OOgfuT9V-wmvw24QdLrNZLW5rvb6dTl5C4-Hzxnug3zaXxmojXCAl4pKlMjJKKd-EsiSKxGxFaiVeWBpQfG5qGK4ywS-UcxRNO2MAaIsmXer0vWSBTIZ5FpDopLzYUOW9iUFO_5bWIjMm0WwqSMURLAsgAFYK3m69fbcyH7OSchGrTczj-1N9mdUjzuc-wYpbEZ_lRFp1GGOvpgoVxn"/>
</div>
<div class="p-5">
<div class="flex justify-between items-start mb-2">
<h2 class="text-2xl font-serif text-white uppercase tracking-tight">Pepperon</h2>
<span class="text-zinc-500 text-[10px] font-mono mt-2 tracking-widest">1.1KM_PROXIMITY</span>
</div>
<div class="flex items-center space-x-3 text-[10px] font-mono text-zinc-500 mb-6 uppercase tracking-wider">
<span class="flex items-center"><span class="material-symbols-outlined text-[12px] mr-1">restaurant</span>Fusion Dining</span>
<span class="w-1 h-1 bg-zinc-800"></span>
<span>Tier: $$$$$</span>
</div>
<div class="flex items-center justify-between pt-4 border-t border-zinc-800">
<div class="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-mono">
                    REQ: FORMAL ATTIRE
                </div>
<button class="px-5 py-2.5 bg-transparent border border-zinc-800 rounded-sm text-[10px] font-bold text-white tracking-widest uppercase hover:border-zinc-100 transition-all">
<span>RESERVE</span>
</button>
</div>
</div>
</div>
</div>
<div class="absolute bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-900">
<nav class="flex items-center justify-around py-4">
<button class="flex flex-col items-center space-y-1 w-1/4">
<span class="material-symbols-outlined text-xixa-green text-[26px]">explore</span>
<span class="text-[9px] font-bold text-xixa-green tracking-widest">RADAR</span>
</button>
<button class="flex flex-col items-center space-y-1 w-1/4 text-zinc-500 hover:text-zinc-300 transition-colors">
<span class="material-symbols-outlined text-[24px]">favorite</span>
<span class="text-[9px] font-bold tracking-widest uppercase">SAVED</span>
</button>
<button class="flex flex-col items-center space-y-1 w-1/4 text-zinc-500 hover:text-zinc-300 transition-colors">
<span class="material-symbols-outlined text-[24px]">confirmation_number</span>
<span class="text-[9px] font-bold tracking-widest uppercase">BOOKED</span>
</button>
<button class="flex flex-col items-center space-y-1 w-1/4 text-zinc-500 hover:text-zinc-300 transition-colors">
<span class="material-symbols-outlined text-[24px]">person</span>
<span class="text-[9px] font-bold tracking-widest uppercase">PROFILE</span>
</button>
</nav>
<div class="h-6 w-full flex justify-center items-center pb-2">
<div class="w-32 h-1 bg-zinc-800 rounded-full"></div>
</div>
</div>

</body></html>