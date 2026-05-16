export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-orbitron">
      <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
      <p className="text-cyan-500 uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando Dados...</p>
    </div>
  );
}
