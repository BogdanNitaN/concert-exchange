'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface Props {
  value: string
  onChange: (date: string) => void
  placeholder?: string
}

const MONTHS = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']
const DAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du']

export default function DatePicker({ value, onChange, placeholder = 'Selectează data' }: Props) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value)
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const selectedDate = value ? new Date(value) : null

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => {
    const d = new Date(year, month, 1).getDay()
    return d === 0 ? 6 : d - 1
  }

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

  const selectDay = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const str = d.toISOString().split('T')[0]
    onChange(str)
    setOpen(false)
  }

  const isPast = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return d < today
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear()
  }

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth())

  const displayValue = selectedDate ? selectedDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <div style={{position:'relative', fontFamily:'Montserrat,sans-serif'}}>
      <div onClick={() => setOpen(!open)}
        style={{width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1px solid ' + (value ? '#059669' : '#e7e5e4'), fontSize:'13px', color: value ? '#1c1917' : '#a8a29e', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', boxSizing:'border-box'}}>
        <span>{displayValue || placeholder}</span>
        <Calendar size={16} color='#a8a29e' strokeWidth={1.5} />
      </div>

      {open && (
        <div style={{position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', border:'1.5px solid #e7e5e4', borderRadius:'16px', zIndex:300, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:'16px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
            <button onClick={prevMonth} style={{background:'none', border:'none', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex'}}>
              <ChevronLeft size={18} color='#1c1917' strokeWidth={2} />
            </button>
            <span style={{fontWeight:700, fontSize:'14px', color:'#1c1917'}}>
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button onClick={nextMonth} style={{background:'none', border:'none', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex'}}>
              <ChevronRight size={18} color='#1c1917' strokeWidth={2} />
            </button>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px', marginBottom:'8px'}}>
            {DAYS.map(d => (
              <div key={d} style={{textAlign:'center', fontSize:'11px', fontWeight:700, color:'#a8a29e', padding:'4px 0'}}>{d}</div>
            ))}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px'}}>
            {Array.from({length: firstDay}).map((_, i) => <div key={'e'+i} />)}
            {Array.from({length: daysInMonth}).map((_, i) => {
              const day = i + 1
              const past = isPast(day)
              const sel = isSelected(day)
              return (
                <button key={day} onClick={() => !past && selectDay(day)} disabled={past}
                  style={{padding:'8px 4px', borderRadius:'8px', border:'none', cursor: past ? 'not-allowed' : 'pointer', fontSize:'13px', fontWeight: sel ? 700 : 400, background: sel ? '#1c1917' : 'transparent', color: past ? '#d4d4d4' : sel ? 'white' : '#1c1917', transition:'all 0.1s'}}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {open && <div style={{position:'fixed', inset:0, zIndex:299}} onClick={() => setOpen(false)} />}
    </div>
  )
}
