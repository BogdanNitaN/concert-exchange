// Antet si footer Forward Agency pentru toate PDF-urile (oferta, disponibilitate, rapoarte)
// Sursa unica: schimbi un contact aici, se schimba peste tot
import type { jsPDF } from 'jspdf'

export function deseneazaHeaderForward(doc: jsPDF, W: number, M: number, logo: string | null) {
  const steps = 80
  for (let i = 0; i < steps; i++) {
    const t = i / steps
    const r = Math.round(180 + (100 - 180) * t)
    const g = Math.round(247 + (210 - 247) * t)
    const b = Math.round(249 + (244 - 249) * t)
    doc.setFillColor(r, g, b)
    doc.rect((W / steps) * i, 0, W / steps + 0.5, 38, 'F')
  }
  doc.setFillColor(255, 255, 255)
  doc.triangle(W, 30, W, 42, W - 60, 42, 'F')
  doc.triangle(0, 38, 0, 44, 70, 44, 'F')
  if (logo) doc.addImage(logo, 'PNG', W - M - 34, 8, 34, 21)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
  doc.text('FORWARD AGENCY', M, 16)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
  doc.setTextColor(10, 50, 65)
  doc.text('Your #1 Artist Booking & Advising Agency', M, 22)
}

export function deseneazaFooterForward(doc: jsPDF, W: number, M: number) {
  const fy = 258
  doc.setDrawColor(129, 212, 242); doc.setLineWidth(0.8)
  doc.line(M, fy, W - M, fy)
  doc.setLineWidth(0.2)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(28,25,23)
  doc.text('Bogdan Nita', M, fy + 6)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80)
  doc.text('Managing Partner, Artist Booking & Advisor', M, fy + 10.5)
  doc.text('+40 751 144 109  ·  bogdan@forward.ro', M, fy + 14.5)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(28,25,23)
  doc.text('Alexandra Stefan', W/2 + 10, fy + 6)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80)
  doc.text('Assistant Contracting, Logistics & Booking Support', W/2 + 10, fy + 10.5)
  doc.text('alexandra.stefan@forward.ro', W/2 + 10, fy + 14.5)
  const now = new Date()
  doc.setFontSize(7.5); doc.setTextColor(150,150,150)
  doc.text('Generat: ' + now.toLocaleDateString('ro-RO') + ' ' + now.toLocaleTimeString('ro-RO', {hour:'2-digit',minute:'2-digit'}), M, fy + 24)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
  const gx = W - M - 20
  doc.setTextColor(28,25,23); doc.text('powered by GIG', gx, fy + 24)
  const gw = doc.getTextWidth('powered by GIG')
  doc.setTextColor(5,150,105); doc.text('x', gx + gw, fy + 24)
}
