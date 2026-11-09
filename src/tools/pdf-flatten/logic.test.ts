import { describe, expect, it } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import { flattenForms } from './logic'

describe('pdf-flatten', () => {
  it('flattens form fields', async () => {
    const d = await PDFDocument.create()
    const page = d.addPage()
    const tf = d.getForm().createTextField('name')
    tf.setText('Ada')
    tf.addToPage(page, { x: 50, y: 700, width: 200, height: 20 })
    const r = await flattenForms(await d.save())
    expect(r.fields).toBe(1)
    expect((await PDFDocument.load(r.bytes)).getForm().getFields()).toHaveLength(0)
  })
})
