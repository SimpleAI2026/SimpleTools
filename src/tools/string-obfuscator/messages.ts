import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'String obfuscator',
    description: 'Mask the middle of each line and keep the ends visible.',
    keepStart: 'Keep start',
    keepEnd: 'Keep end',
    mask: 'Mask',
    usageTitle: 'How to use',
    step1: 'Paste a line such as an email or an id.',
    step2: 'Choose how many characters stay visible at each end.',
    step3: 'Copy the masked text into a note or a prompt when the original should stay hidden.',
  },
  {
    'zh-CN': { name: '字符串遮挡', description: '遮住每一行的中间，保留两端。', keepStart: '保留开头', keepEnd: '保留结尾', mask: '遮挡字符', usageTitle: '使用方法', step1: '粘贴一行，例如邮箱或编号。', step2: '选择两端各保留多少个字符。', step3: '把遮挡后的文本复制到笔记或提示里，原文不必露出。' },
    ja: { name: '文字列の伏せ字', description: '各行の中央を隠し、両端を残します。', keepStart: '先頭を残す', keepEnd: '末尾を残す', mask: '伏せ字', usageTitle: '使い方', step1: 'メールアドレスや ID などの行を貼ります。', step2: '両端に残す文字数を選びます。', step3: '原文を出したくないとき、伏せた文字列をメモや依頼にコピーします。' },
    ko: { name: '문자열 가리기', description: '각 줄의 가운데를 가리고 양쪽 끝은 남깁니다.', keepStart: '앞 유지', keepEnd: '뒤 유지', mask: '가림 문자', usageTitle: '사용 방법', step1: '이메일이나 번호 같은 줄을 붙여 넣습니다.', step2: '양쪽에 남길 글자 수를 고릅니다.', step3: '원문을 숨겨야 할 때 가린 텍스트를 메모나 프롬프트에 복사합니다.' },
    de: { name: 'Text maskieren', description: 'Verdeckt die Mitte jeder Zeile und lässt die Enden sichtbar.', keepStart: 'Anfang behalten', keepEnd: 'Ende behalten', mask: 'Maske', usageTitle: 'Verwendung', step1: 'Eine Zeile einfügen, etwa eine E-Mail oder eine Kennung.', step2: 'Wählen, wie viele Zeichen an jedem Ende sichtbar bleiben.', step3: 'Den maskierten Text kopieren, wenn das Original verborgen bleiben soll.' },
    fr: { name: 'Masquage de texte', description: 'Masque le milieu de chaque ligne et garde les extrémités.', keepStart: 'Garder le début', keepEnd: 'Garder la fin', mask: 'Masque', usageTitle: 'Mode d’emploi', step1: 'Collez une ligne, par exemple un e-mail ou un identifiant.', step2: 'Choisissez combien de caractères restent visibles à chaque bout.', step3: 'Copiez le texte masqué dans une note ou un prompt si l’original doit rester caché.' },
    es: { name: 'Enmascarar texto', description: 'Tapa el centro de cada línea y deja los extremos visibles.', keepStart: 'Conservar el inicio', keepEnd: 'Conservar el final', mask: 'Máscara', usageTitle: 'Cómo usarlo', step1: 'Pega una línea, como un correo o un identificador.', step2: 'Elige cuántos caracteres quedan visibles en cada extremo.', step3: 'Copia el texto tapado a una nota o un prompt si el original debe seguir oculto.' },
    'pt-BR': { name: 'Ocultar texto', description: 'Cobre o meio de cada linha e deixa as pontas visíveis.', keepStart: 'Manter o início', keepEnd: 'Manter o fim', mask: 'Máscara', usageTitle: 'Como usar', step1: 'Cole uma linha, como um e-mail ou um identificador.', step2: 'Escolha quantos caracteres ficam visíveis em cada ponta.', step3: 'Copie o texto coberto para uma nota ou um prompt se o original deve continuar oculto.' },
  },
)
