import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-orbitron">
      <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest text-yellow-500">Coordenadas Inválidas</h2>
      <p className="text-slate-400 mb-8 max-w-md text-center uppercase text-sm">
        A rota solicitada não existe no banco de dados galáctico.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
      >
        VOLTAR AO COMANDO
      </Link>
    </div>
  );
}
