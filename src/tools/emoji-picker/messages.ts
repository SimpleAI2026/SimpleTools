import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Emoji picker',
    description: 'Search the bundled Unicode emoji list and copy a character or its code points.',
    search: 'Search a name, such as rocket',
    loading: 'Loading the local emoji list…',
    usageTitle: 'How to use',
    step1: 'Search by the English name from the Unicode list.',
    step2: 'Click an emoji to copy the character.',
    step3: 'Use the header copy button for the visible rows, including code points.',
  },
  {
    'zh-CN': { name: 'Emoji 选择', description: '搜索内置的 Unicode emoji 列表，并复制字符或码点。', search: '按英文名搜索，例如 rocket', loading: '正在加载本地 emoji 列表…', usageTitle: '使用方法', step1: '用 Unicode 列表里的英文名搜索。', step2: '点击一个 emoji 以复制字符。', step3: '用标题栏的复制按钮复制当前行，其中包含码点。' },
    ja: { name: '絵文字ピッカー', description: '同梱の Unicode 絵文字一覧を検索し、文字か符号位置をコピーします。', search: '英語名で検索。例 rocket', loading: 'ローカルの絵文字一覧を読み込み中…', usageTitle: '使い方', step1: 'Unicode 一覧の英語名で検索します。', step2: '絵文字をクリックして文字をコピーします。', step3: '見出しのコピーで、符号位置を含む表示中の行を取れます。' },
    ko: { name: '이모지 선택', description: '함께 담긴 유니코드 이모지 목록을 검색하고 문자나 코드 포인트를 복사합니다.', search: '영어 이름으로 검색, 예: rocket', loading: '로컬 이모지 목록을 읽는 중…', usageTitle: '사용 방법', step1: '유니코드 목록의 영어 이름으로 검색합니다.', step2: '이모지를 눌러 문자를 복사합니다.', step3: '머리글의 복사 버튼으로 코드 포인트가 포함된 현재 줄을 가져옵니다.' },
    de: { name: 'Emoji-Auswahl', description: 'Durchsucht die mitgelieferte Unicode-Emoji-Liste und kopiert ein Zeichen oder seine Codepunkte.', search: 'Nach dem englischen Namen suchen, etwa rocket', loading: 'Lokale Emoji-Liste wird geladen…', usageTitle: 'Verwendung', step1: 'Nach dem englischen Namen aus der Unicode-Liste suchen.', step2: 'Ein Emoji anklicken, um das Zeichen zu kopieren.', step3: 'Die Kopierfläche in der Kopfzeile nimmt die sichtbaren Zeilen samt Codepunkten.' },
    fr: { name: 'Sélecteur d’emoji', description: 'Cherche dans la liste Unicode embarquée et copie un caractère ou ses points de code.', search: 'Chercher un nom anglais, par exemple rocket', loading: 'Chargement de la liste locale…', usageTitle: 'Mode d’emploi', step1: 'Cherchez le nom anglais de la liste Unicode.', step2: 'Cliquez un emoji pour copier le caractère.', step3: 'Le bouton de copie de l’en-tête prend les lignes visibles, points de code compris.' },
    es: { name: 'Selector de emoji', description: 'Busca en la lista Unicode incluida y copia un carácter o sus puntos de código.', search: 'Busca un nombre en inglés, como rocket', loading: 'Cargando la lista local…', usageTitle: 'Cómo usarlo', step1: 'Busca el nombre en inglés de la lista Unicode.', step2: 'Haz clic en un emoji para copiar el carácter.', step3: 'El botón de copiar de la cabecera toma las filas visibles, con los puntos de código.' },
    'pt-BR': { name: 'Seletor de emoji', description: 'Busca na lista Unicode embutida e copia um caractere ou seus pontos de código.', search: 'Busque um nome em inglês, como rocket', loading: 'Carregando a lista local…', usageTitle: 'Como usar', step1: 'Busque o nome em inglês da lista Unicode.', step2: 'Clique num emoji para copiar o caractere.', step3: 'O botão de copiar do cabeçalho leva as linhas visíveis, com os pontos de código.' },
  },
)
