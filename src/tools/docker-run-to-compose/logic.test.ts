import { describe, expect, it } from 'vitest'
import { convertDockerRun, tokenizeCommand } from './logic'

describe('docker-run-to-compose', () => {
  it('tokenizes quotes and line continuations', () => {
    expect(tokenizeCommand('docker run --name "web app" nginx')).toEqual(['docker', 'run', '--name', 'web app', 'nginx'])
    expect(tokenizeCommand('docker run \\\n  nginx')).toEqual(['docker', 'run', 'nginx'])
  })

  it('converts a typical detached web container', () => {
    const result = convertDockerRun('docker run -d --name web -p 8080:80 -e FOO=bar -v /data:/data --restart unless-stopped nginx:alpine')
    expect(result.error).toBe('')
    expect(result.yaml).toContain('web:')
    expect(result.yaml).toContain('image: nginx:alpine')
    expect(result.yaml).toContain('8080:80')
    expect(result.yaml).toContain('FOO: bar')
    expect(result.yaml).toContain('/data:/data')
    expect(result.yaml).toContain('restart: unless-stopped')
    expect(result.yaml).toContain('container_name: web')
  })

  it('keeps the command, tty, and records ignored flags', () => {
    const result = convertDockerRun(`docker run --rm -it --env-file .env -P ubuntu bash -lc "echo hi"`)
    expect(result.yaml).toContain('image: ubuntu')
    expect(result.yaml).toContain('tty: true')
    expect(result.yaml).toContain('stdin_open: true')
    expect(result.yaml).toContain('bash')
    expect(result.warnings.map((item) => item.code)).toEqual(['ignored-rm', 'env-file', 'publish-all'])
  })

  it('rejects lines that are not docker run', () => {
    expect(convertDockerRun('')).toMatchObject({ error: 'empty' })
    expect(convertDockerRun('docker build .')).toMatchObject({ error: 'not-run' })
    expect(convertDockerRun('docker run -d')).toMatchObject({ error: 'no-image' })
  })
})
