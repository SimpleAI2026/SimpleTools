import { describe, expect, it } from 'vitest'
import { formatJs } from './logic'

const o = { tabWidth: 2, semi: false, singleQuote: true, printWidth: 80 }
describe('javascript-formatter', () => {
  it('formats js', async () => {
    expect(await formatJs('const a = {b:"x"};function f(){return a}', 'babel', o)).toBe("const a = { b: 'x' }\nfunction f() {\n  return a\n}\n")
  })
  it('formats ts', async () => {
    expect(await formatJs('let x:number=1;', 'typescript', { ...o, semi: true })).toBe('let x: number = 1;\n')
  })
  it('throws on syntax errors', async () => {
    await expect(formatJs('function (', 'babel', o)).rejects.toThrow()
  })
})
