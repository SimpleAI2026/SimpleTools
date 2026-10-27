import { randomInt } from '@/lib/random'

const LATIN = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')
const CHINESE = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐'

export type Unit = 'paragraphs' | 'sentences' | 'words'
export type Lang = 'latin' | 'chinese'
type Rand = (n: number) => number

function sentence(lang: Lang, rand: Rand): string {
  if (lang === 'chinese') {
    const len = 8 + rand(12)
    let s = ''
    for (let i = 0; i < len; i++) {
      s += CHINESE[rand(CHINESE.length)]
      if (i > 2 && i < len - 2 && rand(6) === 0) s += '，'
    }
    return s + '。'
  }
  const len = 6 + rand(10)
  const words = Array.from({ length: len }, () => LATIN[rand(LATIN.length)] as string)
  const s = words.join(' ')
  return s.charAt(0).toUpperCase() + s.slice(1) + '.'
}

export function generateLorem(unit: Unit, count: number, lang: Lang = 'latin', startWithLorem = true, rand: Rand = randomInt): string {
  const n = Math.max(1, Math.min(500, Math.floor(count) || 1))
  let out: string
  if (unit === 'words') {
    if (lang === 'chinese') out = Array.from({ length: n }, () => CHINESE[rand(CHINESE.length)]).join('')
    else out = Array.from({ length: n }, () => LATIN[rand(LATIN.length)]).join(' ')
  } else if (unit === 'sentences') {
    out = Array.from({ length: n }, () => sentence(lang, rand)).join(lang === 'chinese' ? '' : ' ')
  } else {
    out = Array.from({ length: n }, () => Array.from({ length: 3 + rand(4) }, () => sentence(lang, rand)).join(lang === 'chinese' ? '' : ' ')).join('\n\n')
  }
  if (startWithLorem && lang === 'latin') {
    const prefix = 'Lorem ipsum dolor sit amet'
    if (unit === 'words') {
      const words = out.split(' ')
      out = [...prefix.split(' '), ...words].slice(0, n).join(' ')
    } else out = `${prefix}, ${out.charAt(0).toLowerCase()}${out.slice(1)}`
  }
  return out
}
