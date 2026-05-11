'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ROLES = [
  { id: 'artist', icon: '🎤', label: 'Artist / DJ', desc: 'Îți gestionezi disponibilitatea și primești cereri' },
  { id: 'agency', icon: '🏢', label: 'Agenție', desc: 'Gestionezi mai mulți artiști' },
  { id: 'promoter', icon: '🎪', label: 'Promoter / Organizator', desc: 'Cauți artiști pentru evenimente' },
  { id: 'client', icon: '🥂', label: 'Client Privat', desc: 'Nuntă, petrecere, eveniment privat' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) { setError('Selectează tipul de cont'); return }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        role,
      })
    }

    if (role === 'artist' || role === 'agency') {
      router.push('/dashboard/artist')
    } else if (role === 'promoter') {
      router.push('/dashboard/promoter')
    } else {
      router.push('/dashboard/client')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Concert <span className="text-amber-500">●</span> Exchange
          </h1>
          <p className="text-stone-500 mt-2 text-sm">Creează-ți contul gratuit</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8">
          
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Ce tip de cont vrei?</h2>
              <p className="text-stone-500 text-sm mb-6">Alege rolul care te descrie cel mai bine</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === r.id
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="font-semibold text-stone-900 text-sm">{r.label}</div>
                    <div className="text-stone-500 text-xs mt-1">{r.desc}</div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={() => { if (!role) { setError('Selectează tipul de cont'); return; } setError(''); setStep(2) }}
                className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors"
              >
                Continuă →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSignup}>
              <button onClick={() => setStep(1)} className="text-stone-400 text-sm mb-4 hover:text-stone-600">
                ← Înapoi
              </button>
              <h2 className="text-xl font-semibold text-stone-900 mb-6">Detaliile contului</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Nume
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Numele tău sau al artistului"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplu.ro"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Parolă
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minim 6 caractere"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mt-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 mt-6"
              >
                {loading ? 'Se creează contul...' : 'Creează cont gratuit'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-stone-500">
            Ai deja cont?{' '}
            <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-700">
              Conectează-te
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}