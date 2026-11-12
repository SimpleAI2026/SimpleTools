import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Benchmark builder',
    description: 'Compare groups of numbers: count, min, max, mean, median, and sample standard deviation.',
    add: 'Add a group',
    group: 'Group',
    mean: 'Mean',
    median: 'Median',
    stdev: 'Stdev',
    empty: 'No numbers in this group.',
    usageTitle: 'How to use',
    step1: 'Paste numbers for each group. Separate them with spaces, commas, or semicolons.',
    step2: 'Read the sample standard deviation, which uses n−1.',
    step3: 'Copy the table into a note. The groups are not sent anywhere.',
  },
  {
    'zh-CN': { name: '基准数据对比', description: '对比多组数字：个数、最小、最大、均值、中位数和样本标准差。', add: '添加一组', group: '分组', mean: '均值', median: '中位数', stdev: '标准差', empty: '这一组没有数字。', usageTitle: '使用方法', step1: '为每一组粘贴数字。用空格、逗号或分号分开。', step2: '查看样本标准差，它使用 n−1。', step3: '把表格复制到笔记。这些分组不会被发送出去。' },
    ja: { name: 'ベンチマーク比較', description: '数の組を比べます。件数、最小、最大、平均、中央値、標本標準偏差です。', add: '組を追加', group: '組', mean: '平均', median: '中央値', stdev: '標準偏差', empty: 'この組に数値がありません。', usageTitle: '使い方', step1: '各組の数値を貼ります。空白、カンマ、セミコロンで区切ります。', step2: '標本標準偏差を読みます。分母は n−1 です。', step3: '表をメモにコピーします。組はどこにも送りません。' },
    ko: { name: '벤치마크 비교', description: '숫자 묶음을 비교합니다. 개수, 최소, 최대, 평균, 중앙값, 표본 표준편차입니다.', add: '묶음 추가', group: '묶음', mean: '평균', median: '중앙값', stdev: '표준편차', empty: '이 묶음에 숫자가 없습니다.', usageTitle: '사용 방법', step1: '각 묶음의 숫자를 붙입니다. 공백, 쉼표, 세미콜론으로 나눕니다.', step2: '표본 표준편차를 읽습니다. 분모는 n−1입니다.', step3: '표를 메모에 복사합니다. 묶음은 어디로도 보내지 않습니다.' },
    de: { name: 'Benchmark-Vergleich', description: 'Vergleicht Zahlengruppen: Anzahl, Min, Max, Mittel, Median und Stichproben-Standardabweichung.', add: 'Gruppe hinzufügen', group: 'Gruppe', mean: 'Mittel', median: 'Median', stdev: 'Stdabw.', empty: 'Keine Zahlen in dieser Gruppe.', usageTitle: 'Verwendung', step1: 'Zahlen je Gruppe einfügen. Trennen mit Leerzeichen, Komma oder Semikolon.', step2: 'Die Stichproben-Standardabweichung lesen; sie nutzt n−1.', step3: 'Die Tabelle in eine Notiz kopieren. Die Gruppen werden nicht verschickt.' },
    fr: { name: 'Comparateur de mesures', description: 'Compare des groupes de nombres : effectif, min, max, moyenne, médiane et écart-type d’échantillon.', add: 'Ajouter un groupe', group: 'Groupe', mean: 'Moyenne', median: 'Médiane', stdev: 'Écart-type', empty: 'Aucun nombre dans ce groupe.', usageTitle: 'Mode d’emploi', step1: 'Collez les nombres de chaque groupe. Séparez-les par des espaces, des virgules ou des points-virgules.', step2: 'Lisez l’écart-type d’échantillon, qui utilise n−1.', step3: 'Copiez le tableau dans une note. Les groupes ne sont pas envoyés.' },
    es: { name: 'Comparador de medidas', description: 'Compara grupos de números: cuenta, mín, máx, media, mediana y desviación típica muestral.', add: 'Añadir un grupo', group: 'Grupo', mean: 'Media', median: 'Mediana', stdev: 'Desv.', empty: 'No hay números en este grupo.', usageTitle: 'Cómo usarlo', step1: 'Pega los números de cada grupo. Sepáralos con espacios, comas o punto y coma.', step2: 'Lee la desviación típica muestral, que usa n−1.', step3: 'Copia la tabla a una nota. Los grupos no se envían.' },
    'pt-BR': { name: 'Comparador de medidas', description: 'Compara grupos de números: contagem, mín, máx, média, mediana e desvio-padrão amostral.', add: 'Adicionar um grupo', group: 'Grupo', mean: 'Média', median: 'Mediana', stdev: 'Desvio', empty: 'Não há números neste grupo.', usageTitle: 'Como usar', step1: 'Cole os números de cada grupo. Separe com espaços, vírgulas ou ponto e vírgula.', step2: 'Leia o desvio-padrão amostral, que usa n−1.', step3: 'Copie a tabela para uma nota. Os grupos não são enviados.' },
  },
)
