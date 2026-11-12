import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'SVG placeholder',
    description: 'Build a sized placeholder SVG and its data URL on this device.',
    width: 'Width',
    height: 'Height',
    bg: 'Background',
    fg: 'Text color',
    label: 'Label',
    auto: 'Use the size when empty',
    usageTitle: 'How to use',
    step1: 'Set the width, height, and colors. Colors must be hex, such as #e5e7eb.',
    step2: 'Leave the label empty to print the size, or type your own caption.',
    step3: 'Copy the SVG into a page or download the file. Nothing is uploaded.',
  },
  {
    'zh-CN': { name: 'SVG 占位图', description: '在本机按尺寸生成占位 SVG 和 data URL。', width: '宽度', height: '高度', bg: '背景色', fg: '文字色', label: '文字', auto: '留空则显示尺寸', usageTitle: '使用方法', step1: '设置宽、高和颜色。颜色使用十六进制，例如 #e5e7eb。', step2: '文字留空就显示尺寸，也可以自己填写说明。', step3: '把 SVG 复制到页面，或下载文件。不会上传。' },
    ja: { name: 'SVG プレースホルダー', description: '指定サイズのプレースホルダー SVG と data URL をこの端末で作ります。', width: '幅', height: '高さ', bg: '背景色', fg: '文字色', label: '文字', auto: '空ならサイズを表示', usageTitle: '使い方', step1: '幅、高さ、色を指定します。色は #e5e7eb のような16進です。', step2: '文字を空にするとサイズを描き、必要ならキャプションを入れます。', step3: 'SVG をページにコピーするか、ファイルを保存します。アップロードしません。' },
    ko: { name: 'SVG 자리표시', description: '이 기기에서 크기별 자리표시 SVG와 data URL을 만듭니다.', width: '너비', height: '높이', bg: '배경색', fg: '글자색', label: '글자', auto: '비우면 크기를 표시', usageTitle: '사용 방법', step1: '너비, 높이, 색을 정합니다. 색은 #e5e7eb 같은 16진수입니다.', step2: '글자를 비우면 크기를 그리고, 필요하면 캡션을 넣습니다.', step3: 'SVG를 페이지에 복사하거나 파일을 받습니다. 업로드하지 않습니다.' },
    de: { name: 'SVG-Platzhalter', description: 'Erzeugt ein SVG in fester Größe und seine Data-URL auf diesem Gerät.', width: 'Breite', height: 'Höhe', bg: 'Hintergrund', fg: 'Textfarbe', label: 'Text', auto: 'Leer zeigt die Größe', usageTitle: 'Verwendung', step1: 'Breite, Höhe und Farben setzen. Farben sind hexadezimal, etwa #e5e7eb.', step2: 'Den Text leer lassen, dann erscheint die Größe, oder eine eigene Beschriftung tippen.', step3: 'Das SVG in eine Seite kopieren oder die Datei laden. Es wird nichts hochgeladen.' },
    fr: { name: 'Placeholder SVG', description: 'Construit un SVG de taille fixe et son data URL sur cet appareil.', width: 'Largeur', height: 'Hauteur', bg: 'Fond', fg: 'Couleur du texte', label: 'Texte', auto: 'Vide : afficher la taille', usageTitle: 'Mode d’emploi', step1: 'Réglez la largeur, la hauteur et les couleurs. Les couleurs sont en hexadécimal, par exemple #e5e7eb.', step2: 'Laissez le texte vide pour afficher la taille, ou saisissez une légende.', step3: 'Copiez le SVG dans une page ou téléchargez le fichier. Rien n’est envoyé.' },
    es: { name: 'Marcador SVG', description: 'Crea un SVG de tamaño fijo y su data URL en este dispositivo.', width: 'Ancho', height: 'Alto', bg: 'Fondo', fg: 'Color del texto', label: 'Texto', auto: 'Vacío: mostrar el tamaño', usageTitle: 'Cómo usarlo', step1: 'Fija el ancho, el alto y los colores. Los colores van en hexadecimal, como #e5e7eb.', step2: 'Deja el texto vacío para mostrar el tamaño, o escribe un rótulo.', step3: 'Copia el SVG a una página o descarga el archivo. No se sube nada.' },
    'pt-BR': { name: 'Marcador SVG', description: 'Monta um SVG de tamanho fixo e seu data URL neste aparelho.', width: 'Largura', height: 'Altura', bg: 'Fundo', fg: 'Cor do texto', label: 'Texto', auto: 'Vazio: mostrar o tamanho', usageTitle: 'Como usar', step1: 'Defina largura, altura e cores. As cores são hexadecimais, como #e5e7eb.', step2: 'Deixe o texto vazio para mostrar o tamanho, ou escreva uma legenda.', step3: 'Copie o SVG para uma página ou baixe o arquivo. Nada é enviado.' },
  },
)
