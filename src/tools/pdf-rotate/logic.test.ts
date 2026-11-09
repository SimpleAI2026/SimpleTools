import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { rotatePdf, rotationMap } from './logic'

describe('pdf-rotate', () => {
  it('maps rotations', () => {
    expect(rotationMap([1, 2], 90)).toEqual({ 1: 90, 2: 90 })
    expect(rotationMap([1], -90, { 1: 90 })).toEqual({ 1: 0 })
  })
  it('rotates pages', async () => {
    const d = await PDFDocument.create()
    d.addPage()
    d.addPage()
    const out = await PDFDocument.load(await rotatePdf(await d.save(), { 2: 270 }))
    expect(out.getPages().map((p) => p.getRotation().angle)).toEqual([0, 270])
  })
})
