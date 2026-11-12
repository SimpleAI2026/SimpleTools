declare module 'ua-parser-js' {
  interface UaSlice {
    name?: string
    version?: string
    major?: string
  }
  interface UaResult {
    ua: string
    browser: UaSlice
    engine: UaSlice
    os: UaSlice
    device: { vendor?: string; model?: string; type?: string }
    cpu: { architecture?: string }
  }
  interface UAParser {
    getResult(): UaResult
  }
  interface UAParserConstructor {
    new (ua?: string): UAParser
    (ua?: string): UaResult
  }
  const UAParser: UAParserConstructor
  export default UAParser
}
