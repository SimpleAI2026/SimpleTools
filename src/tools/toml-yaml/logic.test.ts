import { describe, expect, it } from 'vitest'
import { tomlToYaml, yamlToToml } from './logic'

describe('toml-yaml', () => {
  it('converts both ways', () => {
    const toml = 'title = "SimpleTools"\n\n[owner]\nname = "Ada"\n'
    const yaml = tomlToYaml(toml)
    expect(yaml).toContain('title: SimpleTools')
    expect(yaml).toContain('name: Ada')
    const back = yamlToToml(yaml)
    expect(back).toContain('title = "SimpleTools"')
    expect(back).toContain('name = "Ada"')
  })

  it('rejects a YAML root that is not a table', () => {
    expect(() => yamlToToml('- 1\n- 2\n')).toThrow('root-object')
  })
})
