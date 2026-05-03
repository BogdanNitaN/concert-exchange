import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-stone-900 tracking-tight">
            Concert <span className="text-amber-500">●</span> Exchange
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-stone-600 text-sm font-medium hover:text-stone-900 transition-colors">
              Conectare
            </Link>
            <Link href="/signup" className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
              Înregistrare gratuită
            </Link>
          </div>
        </div>
      </nav>
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl font-bold text-stone-900 leading-tight tracking-tight mb-6">
          Conectăm artiști cu oportunități în zona ta
        </h1>
        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Booking inteligent bazat pe locație. Artiști, promoteri și clienți privați conectați în timp real.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="bg-stone-900 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
            Începe gratuit →
          </Link>
          <Link href="/search" className="border border-stone-200 text-stone-700 px-8 py-4 rounded-xl text-sm font-semibold hover:border-stone-400 transition-colors bg-white">
            Caută artiști
          </Link>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {[
            { num: '24.000+', label: 'Furnizori înregistrați' },
            { num: '146.000+', label: 'Evenimente pe an în România' },
            { num: '3 sec', label: 'Timp mediu de matching' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-stone-900 mb-2">{s.num}</div>
              <div className="text-stone-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-stone-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Gata să începi?</h2>
          <p className="text-stone-400 mb-8">Înregistrare gratuită. Niciun card necesar.</p>
          <Link href="/signup" className="bg-amber-500 text-stone-900 px-8 py-4 rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors">
            Creează cont gratuit →
          </Link>
        </div>
      </section>
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-stone-400 text-sm">
          © 2025 Concert Exchange. Construit pentru industria muzicală din România.
        </div>
      </footer>
    </div>
  )
}
