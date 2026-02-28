<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XIXA: Day Mode Discovery Radar</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:ital,wght@0,400;0,600;1,400&amp;display=swap" rel="stylesheet"/>
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
                            900: "#18181B",
                            950: "#09090B",
                        },
                        stone: {
                            50: "#FAFAF9",
                            100: "#F5F5F4",
                            200: "#E7E5E4",
                            300: "#D6D3D1",
                        },
                        xixa: {
                            green: "#10FF88",
                        },
                    },
                    fontFamily: {
                        sans: ["Inter", "sans-serif"],
                        serif: ["Playfair Display", "serif"],
                    },
                    boxShadow: {
                        "bio-glow": "0 0 12px rgba(16, 255, 136, 0.4)",
                        "bio-glow-intense": "0 0 20px rgba(16, 255, 136, 0.6)",
                        "day-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    }
                }
            }
        };
    </script>
<style>
        .map-bg {
            background-color: #FAFAF9;
            background-image: 
                linear-gradient(rgba(231, 229, 228, 0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(231, 229, 228, 0.6) 1px, transparent 1px);
            background-size: 40px 40px;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; border-color: #10FF88; }
            100% { transform: scale(2.5); opacity: 0; border-color: transparent; }
        }
        .pulse-marker::before {
            content: '';
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            border-radius: 50%;
            border: 1px solid #09090B;
            box-shadow: 0 0 8px rgba(16, 255, 136, 0.3);
            animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .xixa-outline-text {
             text-shadow: 
                -0.5px -0.5px 0 #000,  
                 0.5px -0.5px 0 #000,
                -0.5px  0.5px 0 #000,
                 0.5px  0.5px 0 #000;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
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
<body class="bg-stone-50 text-zinc-950 h-screen w-full overflow-hidden relative font-sans antialiased">
<div class="absolute inset-0 z-0 overflow-hidden">
<div class="absolute inset-0 bg-stone-50 map-bg"></div>
<div class="absolute top-0 right-0 w-[85%] h-[75%] bg-stone-200/40 border-b border-l border-stone-300 rounded-bl-[120px] backdrop-blur-[2px]"></div>
<div class="absolute bottom-20 right-0 w-[45%] h-[35%] bg-stone-200/40 border-t border-l border-stone-300 rounded-tl-[80px] backdrop-blur-[2px]"></div>
<div class="absolute top-[35%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
<div class="relative w-12 h-12 flex items-center justify-center pulse-marker">
<div class="absolute inset-0 rounded-full bg-xixa-green/30 animate-pulse"></div>
<div class="w-8 h-8 rounded-full bg-stone-50 border border-zinc-950 shadow-lg flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
<span class="text-[10px] font-bold text-xixa-green font-mono xixa-outline-text">20</span>
</div>
</div>
<div class="mt-2 px-2 py-1 bg-white/90 border border-zinc-200 backdrop-blur-md rounded-sm text-[10px] text-zinc-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-sm">
                HAVANA BEACH
            </div>
</div>
<div class="absolute top-[42%] left-[32%] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
<div class="relative w-8 h-8 flex items-center justify-center">
<div class="w-5 h-5 rounded-full bg-white border border-zinc-400 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110 shadow-sm">
<span class="text-[8px] font-medium text-zinc-500">12</span>
</div>
</div>
</div>
<div class="absolute bottom-[30%] right-[25%] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
<div class="relative w-14 h-14 flex items-center justify-center pulse-marker">
<div class="absolute inset-0 rounded-full bg-xixa-green/20"></div>
<div class="w-10 h-10 rounded-full bg-stone-50 border border-zinc-950 shadow-lg flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
<span class="text-xs font-bold text-xixa-green font-mono xixa-outline-text">10</span>
</div>
</div>
<div class="mt-2 px-2 py-1 bg-white/90 border border-zinc-200 backdrop-blur-md rounded-sm text-[10px] text-zinc-800 uppercase tracking-widest shadow-sm">
                VIP ZONE
            </div>
</div>
</div>
<div class="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between h-full safe-area-inset">
<div class="pointer-events-auto pt-14 px-6 flex flex-col items-start space-y-4 bg-gradient-to-b from-stone-50 via-stone-50/90 to-transparent pb-12 relative">
<div class="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
<div class="bg-white/80 backdrop-blur-md border border-zinc-200 p-1 rounded-full flex shadow-day-shadow pointer-events-auto">
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all bg-zinc-950 text-white border border-zinc-950 shadow-sm">
<span>⛱️</span>
<span>DAY</span>
</button>
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all bg-transparent text-zinc-500 border border-transparent hover:bg-stone-100">
<span class="opacity-70">🪩</span>
<span>NIGHT</span>
</button>
</div>
</div>
<div class="flex justify-between items-start w-full relative z-20 pt-8">
<div>
<h1 class="font-serif text-4xl text-zinc-950 tracking-tight drop-shadow-sm">XIXA</h1>
<div class="flex items-center space-x-2 mt-1">
<div class="w-1.5 h-1.5 rounded-full bg-xixa-green border border-zinc-950 animate-pulse"></div>
<p class="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Albanian Riviera</p>
</div>
</div>
<div class="flex flex-col items-end space-y-3 pt-0">
<button class="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 bg-white/80 backdrop-blur-sm hover:bg-stone-100 hover:border-zinc-300 transition-all group shadow-sm">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-950 text-xl transition-colors">notifications</span>
</button>
<div class="flex items-center bg-white/90 backdrop-blur-md border border-zinc-200 rounded-lg p-1 shadow-day-shadow">
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-medium text-zinc-500 hover:text-zinc-900 transition-colors border-r border-zinc-200 pr-3">
<span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
<span>List</span>
</button>
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-bold text-xixa-green bg-zinc-950 rounded border border-zinc-950 ml-1 shadow-sm">
<span class="material-symbols-outlined text-[16px] xixa-outline-text">map</span>
<span class="xixa-outline-text">Map</span>
</button>
</div>
</div>
</div>
<div class="flex space-x-3 overflow-x-auto no-scrollbar w-full pb-2 pt-4 pl-0.5">
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-zinc-950 border border-zinc-950 text-xixa-green text-xs font-medium tracking-wide shadow-md transform active:scale-95 transition-all">
                    ALL VENUES
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 text-xs font-medium tracking-wide transition-all shadow-sm">
                    BEACH CLUBS
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 text-xs font-medium tracking-wide transition-all shadow-sm">
                    BOATS
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 text-xs font-medium tracking-wide transition-all shadow-sm">
                    DINING
                </button>
</div>
</div>
<div class="pointer-events-auto absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-30">
<button class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 flex items-center justify-center shadow-lg active:scale-95 transition-all hover:border-zinc-400 group">
<span class="material-symbols-outlined text-zinc-600 group-hover:text-zinc-950 text-lg">my_location</span>
</button>
<div class="flex flex-col rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 shadow-lg overflow-hidden">
<button class="w-10 h-10 flex items-center justify-center hover:bg-stone-100 active:bg-stone-200 transition-colors border-b border-zinc-200 text-zinc-600 hover:text-zinc-950">
<span class="material-symbols-outlined text-lg">add</span>
</button>
<button class="w-10 h-10 flex items-center justify-center hover:bg-stone-100 active:bg-stone-200 transition-colors text-zinc-600 hover:text-zinc-950">
<span class="material-symbols-outlined text-lg">remove</span>
</button>
</div>
</div>
<div class="pointer-events-auto bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent pt-12 pb-8 px-6 z-30">
<div class="relative mb-6 group">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-zinc-500 group-focus-within:text-zinc-950 transition-colors">search</span>
</div>
<input class="block w-full pl-11 pr-12 py-3.5 bg-white/70 backdrop-blur-lg border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all shadow-sm" placeholder="Find elite venues, yachts..." type="text"/>
<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
<button class="p-1 rounded hover:bg-stone-200 transition-colors">
<span class="material-symbols-outlined text-zinc-500 hover:text-zinc-950 text-lg">tune</span>
</button>
</div>
</div>
<nav class="relative rounded-2xl bg-white/60 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
<div class="flex items-center justify-around py-4 relative z-10">
<button class="flex flex-col items-center space-y-1 group w-1/4">
<span class="material-symbols-outlined text-xixa-green text-[28px] drop-shadow-sm xixa-outline-text">explore</span>
<span class="text-[10px] font-bold text-zinc-950 tracking-wide">DISCOVER</span>
<div class="w-1 h-1 rounded-full bg-zinc-950 mt-1"></div>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
<span class="material-symbols-outlined text-zinc-800 group-hover:text-zinc-950 text-[24px]">favorite</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-950 tracking-wide">SAVED</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
<span class="material-symbols-outlined text-zinc-800 group-hover:text-zinc-950 text-[24px]">confirmation_number</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-950 tracking-wide">BOOKINGS</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
<span class="material-symbols-outlined text-zinc-800 group-hover:text-zinc-950 text-[24px]">person</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-950 tracking-wide">PROFILE</span>
</button>
</div>
</nav>
</div>
</div>

</body></html>