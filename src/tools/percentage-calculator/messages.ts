import { defineToolMessages } from '@/i18n/defineToolMessages'

const modes = {
  en: { of: 'X% of Y', ratio: 'X is what % of Y', change: 'Change from X to Y', add: 'X plus Y%', sub: 'X minus Y%' },
  'zh-CN': { of: 'Y 的 X%', ratio: 'X 是 Y 的百分之几', change: '从 X 到 Y 的变化', add: 'X 增加 Y%', sub: 'X 减少 Y%' },
  ja: { of: 'Y の X%', ratio: 'X は Y の何%', change: 'X から Y への変化', add: 'X に Y% を足す', sub: 'X から Y% を引く' },
  ko: { of: 'Y의 X%', ratio: 'X는 Y의 몇 %', change: 'X에서 Y로의 변화', add: 'X에 Y% 더하기', sub: 'X에서 Y% 빼기' },
  de: { of: 'X % von Y', ratio: 'X ist wie viel % von Y', change: 'Änderung von X nach Y', add: 'X plus Y %', sub: 'X minus Y %' },
  fr: { of: 'X % de Y', ratio: 'X est quel % de Y', change: 'Variation de X à Y', add: 'X plus Y %', sub: 'X moins Y %' },
  es: { of: 'X % de Y', ratio: 'X es qué % de Y', change: 'Cambio de X a Y', add: 'X más Y %', sub: 'X menos Y %' },
  'pt-BR': { of: 'X% de Y', ratio: 'X é quantos % de Y', change: 'Variação de X para Y', add: 'X mais Y%', sub: 'X menos Y%' },
}
const a = {
  en: { of: 'Percent', ratio: 'Part', change: 'From', add: 'Value', sub: 'Value' },
  'zh-CN': { of: '百分比', ratio: '部分', change: '原来', add: '数值', sub: '数值' },
  ja: { of: 'パーセント', ratio: '部分', change: '元', add: '値', sub: '値' },
  ko: { of: '퍼센트', ratio: '부분', change: '원래', add: '값', sub: '값' },
  de: { of: 'Prozent', ratio: 'Teil', change: 'Von', add: 'Wert', sub: 'Wert' },
  fr: { of: 'Pourcentage', ratio: 'Partie', change: 'De', add: 'Valeur', sub: 'Valeur' },
  es: { of: 'Porcentaje', ratio: 'Parte', change: 'Desde', add: 'Valor', sub: 'Valor' },
  'pt-BR': { of: 'Porcentagem', ratio: 'Parte', change: 'De', add: 'Valor', sub: 'Valor' },
}
const b = {
  en: { of: 'Whole', ratio: 'Whole', change: 'To', add: 'Percent', sub: 'Percent' },
  'zh-CN': { of: '整体', ratio: '整体', change: '变成', add: '百分比', sub: '百分比' },
  ja: { of: '全体', ratio: '全体', change: '先', add: 'パーセント', sub: 'パーセント' },
  ko: { of: '전체', ratio: '전체', change: '이후', add: '퍼센트', sub: '퍼센트' },
  de: { of: 'Ganzes', ratio: 'Ganzes', change: 'Nach', add: 'Prozent', sub: 'Prozent' },
  fr: { of: 'Total', ratio: 'Total', change: 'Vers', add: 'Pourcentage', sub: 'Pourcentage' },
  es: { of: 'Total', ratio: 'Total', change: 'Hasta', add: 'Porcentaje', sub: 'Porcentaje' },
  'pt-BR': { of: 'Total', ratio: 'Total', change: 'Para', add: 'Porcentagem', sub: 'Porcentagem' },
}

export default defineToolMessages(
  {
    name: 'Percentage calculator',
    description: 'Find a percent of a value, a ratio, a change, or add and subtract a percent.',
    modes: modes.en,
    a: a.en,
    b: b.en,
    invalid: 'That pair cannot be calculated. A ratio or a change needs a non-zero base.',
    usageTitle: 'How to use',
    step1: 'Pick the question: a share, a ratio, a change, or adding and subtracting a percent.',
    step2: 'Fill the two numbers. A zero base for a ratio or a change stays blank.',
    step3: 'Copy the number into a note. The math runs on this device.',
  },
  {
    'zh-CN': { name: '百分比计算', description: '计算占比、比例、变化幅度，以及按百分比增减。', modes: modes['zh-CN'], a: a['zh-CN'], b: b['zh-CN'], invalid: '这一对数字算不出来。比例或变化需要非零的基准。', usageTitle: '使用方法', step1: '先选问题：占比、比例、变化，或按百分比增减。', step2: '填两个数。比例或变化的基准为零时结果留空。', step3: '把数字复制到笔记。计算在本机完成。' },
    ja: { name: 'パーセント計算', description: '割合、比率、変化率、パーセントの加減を計算します。', modes: modes.ja, a: a.ja, b: b.ja, invalid: 'この組は計算できません。比率や変化にはゼロ以外の基準が必要です。', usageTitle: '使い方', step1: '問いを選びます。割合、比率、変化、またはパーセントの加減です。', step2: '二つの数を入れます。比率や変化の基準がゼロなら空のままです。', step3: '数字をメモにコピーします。計算はこの端末で行います。' },
    ko: { name: '백분율 계산', description: '비율, 변화, 백분율 가감을 계산합니다.', modes: modes.ko, a: a.ko, b: b.ko, invalid: '이 쌍은 계산할 수 없습니다. 비율이나 변화는 0이 아닌 기준이 필요합니다.', usageTitle: '사용 방법', step1: '질문을 고릅니다. 몫, 비율, 변화, 또는 백분율 가감입니다.', step2: '두 수를 넣습니다. 비율이나 변화의 기준이 0이면 비워 둡니다.', step3: '숫자를 메모에 복사합니다. 계산은 이 기기에서 합니다.' },
    de: { name: 'Prozentrechner', description: 'Berechnet einen Anteil, ein Verhältnis, eine Änderung oder addiert und subtrahiert Prozent.', modes: modes.de, a: a.de, b: b.de, invalid: 'Dieses Paar lässt sich nicht rechnen. Verhältnis und Änderung brauchen eine Basis ungleich null.', usageTitle: 'Verwendung', step1: 'Die Frage wählen: Anteil, Verhältnis, Änderung oder Prozent addieren und subtrahieren.', step2: 'Die zwei Zahlen eintragen. Eine Basis von null bei Verhältnis oder Änderung bleibt leer.', step3: 'Die Zahl in eine Notiz kopieren. Gerechnet wird auf diesem Gerät.' },
    fr: { name: 'Calcul de pourcentage', description: 'Calcule une part, un ratio, une variation, ou ajoute et retire un pourcentage.', modes: modes.fr, a: a.fr, b: b.fr, invalid: 'Cette paire ne se calcule pas. Un ratio ou une variation exige une base non nulle.', usageTitle: 'Mode d’emploi', step1: 'Choisissez la question : une part, un ratio, une variation, ou ajouter et retirer un pourcentage.', step2: 'Remplissez les deux nombres. Une base nulle pour un ratio ou une variation reste vide.', step3: 'Copiez le nombre dans une note. Le calcul se fait sur cet appareil.' },
    es: { name: 'Calculadora de porcentajes', description: 'Calcula una parte, una razón, un cambio, o suma y resta un porcentaje.', modes: modes.es, a: a.es, b: b.es, invalid: 'Ese par no se puede calcular. Una razón o un cambio necesita una base distinta de cero.', usageTitle: 'Cómo usarlo', step1: 'Elige la pregunta: una parte, una razón, un cambio, o sumar y restar un porcentaje.', step2: 'Rellena los dos números. Una base cero en razón o cambio se queda en blanco.', step3: 'Copia el número a una nota. La cuenta se hace en este dispositivo.' },
    'pt-BR': { name: 'Calculadora de porcentagem', description: 'Calcula uma parte, uma razão, uma variação, ou soma e subtrai uma porcentagem.', modes: modes['pt-BR'], a: a['pt-BR'], b: b['pt-BR'], invalid: 'Esse par não pode ser calculado. Uma razão ou uma variação precisa de uma base diferente de zero.', usageTitle: 'Como usar', step1: 'Escolha a pergunta: uma parte, uma razão, uma variação, ou somar e subtrair uma porcentagem.', step2: 'Preencha os dois números. Uma base zero em razão ou variação fica em branco.', step3: 'Copie o número para uma nota. A conta roda neste aparelho.' },
  },
)
