import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser'

const ATTR = '@_'

export function xmlToJson(xml: string, indent = 2): string {
  const valid = XMLValidator.validate(xml)
  if (valid !== true) throw new Error(`Line ${valid.err.line}: ${valid.err.msg}`)
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: ATTR, parseAttributeValue: true, textNodeName: '#text', ignoreDeclaration: true })
  return JSON.stringify(parser.parse(xml), null, indent)
}

export function jsonToXml(json: string, rootName = 'root', indent = 2): string {
  let data: unknown = JSON.parse(json)
  // XML needs exactly one root element
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length !== 1) data = { [rootName]: Array.isArray(data) ? { item: data } : data }
  const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: ATTR, textNodeName: '#text', format: true, indentBy: ' '.repeat(indent), suppressEmptyNode: true })
  return `<?xml version="1.0" encoding="UTF-8"?>\n${(builder.build(data) as string).trim()}`
}
