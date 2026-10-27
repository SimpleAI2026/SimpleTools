/** Caesar shift of ASCII letters (ROT13 when n = 13). Optionally ROT5 digits. */
export function rotate(text: string, n = 13, digits = false): string {
  const k = ((n % 26) + 26) % 26
  return text.replace(/[a-zA-Z0-9]/g, (c) => {
    const code = c.charCodeAt(0)
    if (c >= 'a' && c <= 'z') return String.fromCharCode(((code - 97 + k) % 26) + 97)
    if (c >= 'A' && c <= 'Z') return String.fromCharCode(((code - 65 + k) % 26) + 65)
    return digits ? String.fromCharCode(((code - 48 + 5) % 10) + 48) : c
  })
}
