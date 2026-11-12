import { describe, expect, it } from 'vitest'
import { evaluateMath, type AngleMode } from './logic'

function formatted(expression: string, angle?: AngleMode) {
  const result = evaluateMath(expression, angle)
  if (!result.ok) throw new Error(result.error)
  return result.formatted
}

function errorOf(expression: string) {
  const result = evaluateMath(expression)
  if (result.ok) throw new Error('expected failure')
  return result.error
}

describe('math-evaluator', () => {
  it('respects precedence, powers and parentheses', () => {
    expect(formatted('1+2*3')).toBe('7')
    expect(formatted('(1+2)*3')).toBe('9')
    expect(formatted('2^3^2')).toBe('512')
    expect(formatted('2^10')).toBe('1024')
    expect(formatted('0.1+0.2')).toBe('0.3')
  })

  it('evaluates functions, constants and postfix percent without eval', () => {
    expect(formatted('sin(pi/2)')).toBe('1')
    expect(formatted('sin(90)', 'deg')).toBe('1')
    expect(formatted('sqrt(9)+min(3,1,2)')).toBe('4')
    expect(formatted('10%+1')).toBe('1.1')
    expect(formatted('log(e)')).toBe('1')
    expect(formatted('abs(-4)')).toBe('4')
    expect(formatted('10 % 3')).toBe('1')
  })

  it('rejects unsafe or incomplete input', () => {
    expect(errorOf('')).toBe('empty')
    expect(errorOf('1+')).toBe('invalid')
    expect(errorOf('1/0')).toBe('div0')
    expect(errorOf('eval(1)')).toBe('unknown')
    expect(errorOf('constructor')).toBe('unknown')
    expect(errorOf('foo(1)')).toBe('unknown')
    expect(errorOf('sqrt()')).toBe('arity')
    expect(errorOf('sqrt(-1)')).toBe('domain')
  })
})
