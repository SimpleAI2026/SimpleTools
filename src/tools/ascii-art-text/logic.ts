import figlet from 'figlet'
import standard from 'figlet/fonts/Standard'

let ready = false
function ensureFont() {
  if (ready) return
  figlet.parseFont('Standard', standard)
  ready = true
}

export function asciiArt(text: string): string {
  ensureFont()
  const cleaned = text.replace(/\r\n?/g, '\n').slice(0, 40)
  return figlet.textSync(cleaned, { font: 'Standard' }) ?? ''
}
