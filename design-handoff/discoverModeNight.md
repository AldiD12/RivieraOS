<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XIXA: The High-Voltage Radar UI</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Playfair+Display:ital,wght@0,400;0,600;1,400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        zinc: {
                            400: "#A1A1AA",
                            800: "#27272A",
                            900: "#18181B",
                            950: "#09090B",
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
                    }
                }
            }
        };
    </script>
<style>
        .map-bg {
            background-color: #09090B;
            background-image: 
                linear-gradient(rgba(39, 39, 42, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(39, 39, 42, 0.3) 1px, transparent 1px);
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
            border: 1px solid #10FF88;
            box-shadow: 0 0 12px rgba(16, 255, 136, 0.4);
            animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .xixa-shadow {
            filter: drop-shadow(0 0 4px rgba(16, 255, 136, 0.4));
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
<script>
        function toggleTheme(mode) {
            // Functionality kept for structure, but visual design enforces dark/industrial look
            const html = document.querySelector('html');
            if (mode === 'day') {
               // Logic to switch day (not used in this strict redesign request but kept for functional integrity)
            } 
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-zinc-950 text-white h-screen w-full overflow-hidden relative font-sans antialiased">
<div class="absolute inset-0 z-0 overflow-hidden">
<div class="absolute inset-0 bg-zinc-950 map-bg"></div>
<div class="absolute top-0 right-0 w-[85%] h-[75%] bg-zinc-900/40 border-b border-l border-zinc-800 rounded-bl-[120px] backdrop-blur-[2px]"></div>
<div class="absolute bottom-20 right-0 w-[45%] h-[35%] bg-zinc-900/40 border-t border-l border-zinc-800 rounded-tl-[80px] backdrop-blur-[2px]"></div>
<div class="absolute top-[35%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
<div class="relative w-12 h-12 flex items-center justify-center pulse-marker">
<div class="absolute inset-0 rounded-full bg-xixa-green/20 animate-pulse shadow-bio-glow"></div>
<div class="w-8 h-8 rounded-full bg-zinc-950 border border-xixa-green shadow-bio-glow flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
<span class="text-[10px] font-bold text-xixa-green font-mono">20</span>
</div>
</div>
<div class="mt-2 px-2 py-1 bg-zinc-950/90 border border-zinc-800 backdrop-blur-md rounded-sm text-[10px] text-zinc-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                HAVANA BEACH
            </div>
</div>
<div class="absolute top-[42%] left-[32%] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
<div class="relative w-8 h-8 flex items-center justify-center">
<div class="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
<span class="text-[8px] font-medium text-zinc-400">12</span>
</div>
</div>
</div>
<div class="absolute bottom-[30%] right-[25%] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
<div class="relative w-14 h-14 flex items-center justify-center pulse-marker">
<div class="absolute inset-0 rounded-full bg-xixa-green/10"></div>
<div class="w-10 h-10 rounded-full bg-zinc-950 border border-xixa-green shadow-bio-glow-intense flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110">
<span class="text-xs font-bold text-xixa-green font-mono">10</span>
</div>
</div>
<div class="mt-2 px-2 py-1 bg-zinc-950/90 border border-zinc-800 backdrop-blur-md rounded-sm text-[10px] text-zinc-400 uppercase tracking-widest">
                VIP ZONE
            </div>
</div>
</div>
<div class="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between h-full safe-area-inset">
<div class="pointer-events-auto pt-14 px-6 flex flex-col items-start space-y-4 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent pb-12 relative">
<div class="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
<div class="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-1 rounded-full flex shadow-lg pointer-events-auto">
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all bg-zinc-800 text-zinc-400 border border-zinc-700/50" onclick="toggleTheme('day')">
<span class="opacity-70">⛱️</span>
<span>DAY</span>
</button>
<button class="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all bg-zinc-950 text-xixa-green border border-zinc-800 shadow-bio-glow" onclick="toggleTheme('night')">
<span class="xixa-shadow">🪩</span>
<span class="xixa-shadow">NIGHT</span>
</button>
</div>
</div>
<div class="flex justify-between items-start w-full relative z-20 pt-8">
<div>
<h1 class="font-serif text-4xl text-white tracking-tight drop-shadow-lg">XIXA</h1>
<div class="flex items-center space-x-2 mt-1">
<div class="w-1.5 h-1.5 rounded-full bg-xixa-green shadow-bio-glow animate-pulse"></div>
<p class="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase">Albanian Riviera</p>
</div>
</div>
<div class="flex flex-col items-end space-y-3 pt-0">
<button class="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800 hover:border-xixa-green/50 transition-all group">
<span class="material-symbols-outlined text-zinc-400 group-hover:text-xixa-green text-xl transition-colors">notifications</span>
</button>
<div class="flex items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-lg p-1 shadow-lg">
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-medium text-zinc-500 hover:text-white transition-colors border-r border-zinc-800 pr-3">
<span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
<span>List</span>
</button>
<button class="px-3 py-1.5 flex items-center space-x-2 text-[10px] uppercase font-bold text-xixa-green bg-zinc-950 rounded border border-zinc-800 shadow-bio-glow ml-1">
<span class="material-symbols-outlined text-[16px] xixa-shadow">map</span>
<span class="xixa-shadow">Map</span>
</button>
</div>
</div>
</div>
<div class="flex space-x-3 overflow-x-auto no-scrollbar w-full pb-2 pt-4 pl-0.5">
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-zinc-950 border border-xixa-green text-xixa-green text-xs font-medium tracking-wide shadow-bio-glow transform active:scale-95 transition-all">
                    ALL VENUES
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium tracking-wide transition-all">
                    BEACH CLUBS
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium tracking-wide transition-all">
                    BOATS
                </button>
<button class="whitespace-nowrap px-5 py-2 rounded-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium tracking-wide transition-all">
                    DINING
                </button>
</div>
</div>
<div class="pointer-events-auto absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-30">
<button class="w-10 h-10 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 flex items-center justify-center shadow-lg active:scale-95 transition-all hover:border-xixa-green/30 group">
<span class="material-symbols-outlined text-zinc-400 group-hover:text-xixa-green text-lg group-hover:drop-shadow-[0_0_5px_rgba(16,255,136,0.4)]">my_location</span>
</button>
<div class="flex flex-col rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-lg overflow-hidden">
<button class="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 active:bg-zinc-700 transition-colors border-b border-zinc-800 text-zinc-400 hover:text-white">
<span class="material-symbols-outlined text-lg">add</span>
</button>
<button class="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 active:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
<span class="material-symbols-outlined text-lg">remove</span>
</button>
</div>
</div>
<div class="pointer-events-auto bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-12 pb-8 px-6 z-30">
<div class="relative mb-6 group">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-zinc-500 group-focus-within:text-xixa-green transition-colors drop-shadow-sm">search</span>
</div>
<input class="block w-full pl-11 pr-12 py-3.5 bg-zinc-900/50 backdrop-blur-lg border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-xixa-green focus:border-xixa-green transition-all shadow-inner" placeholder="Find elite venues, yachts..." type="text"/>
<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
<button class="p-1 rounded hover:bg-zinc-800 transition-colors">
<span class="material-symbols-outlined text-zinc-500 hover:text-white text-lg">tune</span>
</button>
</div>
</div>
<nav class="relative rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl overflow-hidden">
<div class="flex items-center justify-around py-4">
<button class="flex flex-col items-center space-y-1 group w-1/4">
<span class="material-symbols-outlined text-xixa-green text-[28px] xixa-shadow">explore</span>
<span class="text-[10px] font-medium text-white tracking-wide xixa-shadow">DISCOVER</span>
<div class="w-1 h-1 rounded-full bg-xixa-green mt-1 shadow-bio-glow"></div>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-white text-[24px]">favorite</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-white tracking-wide">SAVED</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-white text-[24px]">confirmation_number</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-white tracking-wide">BOOKINGS</span>
</button>
<button class="flex flex-col items-center space-y-1 group w-1/4 hover:opacity-100 opacity-60 transition-opacity">
<span class="material-symbols-outlined text-zinc-500 group-hover:text-white text-[24px]">person</span>
<span class="text-[10px] font-medium text-zinc-500 group-hover:text-white tracking-wide">PROFILE</span>
</button>
</div>
</nav>
</div>
</div>

</body></html>