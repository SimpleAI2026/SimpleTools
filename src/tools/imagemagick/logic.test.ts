import { describe, expect, it } from 'vitest'
import { buildPipeline, clampQuality, fitSize, withFormatExt } from './logic'

describe('imagemagick logic', () => {
  it('fits without upscaling', () => {
    expect(fitSize(2000, 1000, 1000, 0)).toEqual({ width: 1000, height: 500 })
    expect(fitSize(100, 50, 1000, 1000)).toEqual({ width: 100, height: 50 })
  })
  it('builds pipeline with crop rotate flip', () => {
    const ops = buildPipeline({
      autoOrient: true,
      maxWidth: 800,
      maxHeight: 0,
      cropEnabled: true,
      cropX: 10,
      cropY: 20,
      cropW: 100,
      cropH: 80,
      rotate: 90,
      flip: true,
      flop: false,
      blurEnabled: false,
      blurRadius: 0,
      blurSigma: 1,
      sharpenEnabled: true,
      sharpenRadius: 1,
      sharpenSigma: 1,
      modulateEnabled: true,
      brightness: 110,
      saturation: 100,
      hue: 100,
      quality: 85,
    })
    expect(ops.map((o) => o.type)).toEqual([
      'autoOrient',
      'crop',
      'resize',
      'rotate',
      'flip',
      'sharpen',
      'modulate',
      'quality',
    ])
    expect(withFormatExt('a.PNG', 'AVIF')).toBe('a.avif')
    expect(clampQuality(200)).toBe(100)
  })
})
