export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">{message}</p>
      </div>
    </div>
  );
}
