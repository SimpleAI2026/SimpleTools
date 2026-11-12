import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Numeronym generator',
    description: 'Shorten each word to its first letter, the middle count, and its last letter.',
    usageTitle: 'How to use',
    step1: 'Paste one word per line, such as internationalization.',
    step2: 'Words shorter than four characters stay unchanged.',
    step3: 'Copy i18n, k8s, or a11y into a note. The count is the characters between the ends.',
  },
  {
    'zh-CN': { name: '数字缩写', description: '把每个词收成首字母、中间字数和尾字母。', usageTitle: '使用方法', step1: '每行粘贴一个词，例如 internationalization。', step2: '少于四个字符的词保持原样。', step3: '把 i18n、k8s 或 a11y 复制到笔记。中间的数字是两端之间的字符数。' },
    ja: { name: 'ヌメロニム', description: '各語を、先頭、間の文字数、末尾の形に縮めます。', usageTitle: '使い方', step1: '1 行に 1 語、例えば internationalization を貼ります。', step2: '4 文字未満はそのままです。', step3: 'i18n、k8s、a11y をメモにコピーします。数字は両端の間の文字数です。' },
    ko: { name: '숫자 약어', description: '각 단어를 첫 글자, 가운데 글자 수, 마지막 글자로 줄입니다.', usageTitle: '사용 방법', step1: '한 줄에 한 단어, 예를 들어 internationalization을 붙입니다.', step2: '네 글자보다 짧은 단어는 그대로 둡니다.', step3: 'i18n, k8s, a11y를 메모에 복사합니다. 숫자는 양쪽 사이의 글자 수입니다.' },
    de: { name: 'Numeronym', description: 'Kürzt jedes Wort auf Anfangsbuchstabe, Anzahl der Mitte und Endbuchstabe.', usageTitle: 'Verwendung', step1: 'Ein Wort je Zeile einfügen, etwa internationalization.', step2: 'Wörter mit weniger als vier Zeichen bleiben unverändert.', step3: 'i18n, k8s oder a11y in eine Notiz kopieren. Die Zahl zählt die Zeichen zwischen den Enden.' },
    fr: { name: 'Numéronyme', description: 'Réduit chaque mot à sa première lettre, au nombre du milieu et à sa dernière lettre.', usageTitle: 'Mode d’emploi', step1: 'Collez un mot par ligne, par exemple internationalization.', step2: 'Les mots de moins de quatre caractères restent intacts.', step3: 'Copiez i18n, k8s ou a11y dans une note. Le nombre compte les caractères entre les extrémités.' },
    es: { name: 'Numerónimo', description: 'Acorta cada palabra a su inicial, el recuento del medio y su última letra.', usageTitle: 'Cómo usarlo', step1: 'Pega una palabra por línea, por ejemplo internationalization.', step2: 'Las palabras de menos de cuatro caracteres no cambian.', step3: 'Copia i18n, k8s o a11y a una nota. El número cuenta los caracteres entre los extremos.' },
    'pt-BR': { name: 'Numerônimo', description: 'Encurta cada palavra para a inicial, a contagem do meio e a última letra.', usageTitle: 'Como usar', step1: 'Cole uma palavra por linha, por exemplo internationalization.', step2: 'Palavras com menos de quatro caracteres ficam iguais.', step3: 'Copie i18n, k8s ou a11y para uma nota. O número conta os caracteres entre as pontas.' },
  },
)
