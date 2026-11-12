import { defineToolMessages } from '@/i18n/defineToolMessages'

const fields = {
  en: { title: 'Title', description: 'Description', url: 'Canonical URL', image: 'Image URL', siteName: 'Site name', author: 'Author', keywords: 'Keywords', locale: 'Locale', robots: 'Robots', twitterCard: 'Twitter card' },
  'zh-CN': { title: '标题', description: '描述', url: '规范网址', image: '图片网址', siteName: '站点名', author: '作者', keywords: '关键词', locale: '语言区域', robots: 'Robots', twitterCard: 'Twitter 卡片' },
  ja: { title: 'タイトル', description: '説明', url: '正規 URL', image: '画像 URL', siteName: 'サイト名', author: '著者', keywords: 'キーワード', locale: 'ロケール', robots: 'Robots', twitterCard: 'Twitter カード' },
  ko: { title: '제목', description: '설명', url: '표준 URL', image: '이미지 URL', siteName: '사이트 이름', author: '작성자', keywords: '키워드', locale: '로캘', robots: 'Robots', twitterCard: 'Twitter 카드' },
  de: { title: 'Titel', description: 'Beschreibung', url: 'Kanonische URL', image: 'Bild-URL', siteName: 'Sitename', author: 'Autor', keywords: 'Schlüsselwörter', locale: 'Locale', robots: 'Robots', twitterCard: 'Twitter-Karte' },
  fr: { title: 'Titre', description: 'Description', url: 'URL canonique', image: 'URL de l’image', siteName: 'Nom du site', author: 'Auteur', keywords: 'Mots-clés', locale: 'Locale', robots: 'Robots', twitterCard: 'Carte Twitter' },
  es: { title: 'Título', description: 'Descripción', url: 'URL canónica', image: 'URL de la imagen', siteName: 'Nombre del sitio', author: 'Autor', keywords: 'Palabras clave', locale: 'Configuración regional', robots: 'Robots', twitterCard: 'Tarjeta de Twitter' },
  'pt-BR': { title: 'Título', description: 'Descrição', url: 'URL canônica', image: 'URL da imagem', siteName: 'Nome do site', author: 'Autor', keywords: 'Palavras-chave', locale: 'Localidade', robots: 'Robots', twitterCard: 'Cartão do Twitter' },
}

export default defineToolMessages(
  {
    name: 'Meta tag generator',
    description: 'Write HTML title, description, Open Graph, and Twitter tags locally.',
    fields: fields.en,
    usageTitle: 'How to use',
    step1: 'Fill the title, description, URL, and image. Empty fields are omitted.',
    step2: 'Copy the markup into the head of a page.',
    step3: 'Quotes and angle brackets in the values are escaped. The tool does not fetch the image.',
  },
  {
    'zh-CN': { name: 'Meta 标签生成', description: '在本地写出 HTML 标题、描述、Open Graph 和 Twitter 标签。', fields: fields['zh-CN'], usageTitle: '使用方法', step1: '填写标题、描述、网址和图片。空字段会省略。', step2: '把标记复制到页面的 head 里。', step3: '字段里的引号和尖括号会被转义。这个工具不会去取图片。' },
    ja: { name: 'メタタグ生成', description: 'HTML の title、description、Open Graph、Twitter タグをこの端末で書きます。', fields: fields.ja, usageTitle: '使い方', step1: 'タイトル、説明、URL、画像を入れます。空の項目は出しません。', step2: 'マークアップをページの head にコピーします。', step3: '値の引用符と山括弧はエスケープします。画像は取得しません。' },
    ko: { name: '메타 태그 생성', description: 'HTML 제목, 설명, Open Graph, Twitter 태그를 이 기기에서 작성합니다.', fields: fields.ko, usageTitle: '사용 방법', step1: '제목, 설명, URL, 이미지를 채웁니다. 빈 항목은 빠집니다.', step2: '마크업을 페이지 head에 복사합니다.', step3: '값의 따옴표와 꺾쇠는 이스케이프합니다. 이미지는 가져오지 않습니다.' },
    de: { name: 'Meta-Tags', description: 'Schreibt HTML-Titel, Beschreibung, Open Graph und Twitter-Tags lokal.', fields: fields.de, usageTitle: 'Verwendung', step1: 'Titel, Beschreibung, URL und Bild ausfüllen. Leere Felder entfallen.', step2: 'Das Markup in den head einer Seite kopieren.', step3: 'Anführungszeichen und spitze Klammern werden maskiert. Das Bild wird nicht geladen.' },
    fr: { name: 'Balises meta', description: 'Écrit localement le titre HTML, la description et les balises Open Graph et Twitter.', fields: fields.fr, usageTitle: 'Mode d’emploi', step1: 'Remplissez le titre, la description, l’URL et l’image. Les champs vides sont omis.', step2: 'Copiez le balisage dans le head d’une page.', step3: 'Les guillemets et les chevrons sont échappés. L’image n’est pas téléchargée.' },
    es: { name: 'Etiquetas meta', description: 'Escribe en local el título HTML, la descripción y las etiquetas Open Graph y Twitter.', fields: fields.es, usageTitle: 'Cómo usarlo', step1: 'Completa título, descripción, URL e imagen. Los campos vacíos se omiten.', step2: 'Copia el marcado al head de una página.', step3: 'Las comillas y los ángulos se escapan. La imagen no se descarga.' },
    'pt-BR': { name: 'Meta tags', description: 'Escreve localmente o título HTML, a descrição e as tags Open Graph e Twitter.', fields: fields['pt-BR'], usageTitle: 'Como usar', step1: 'Preencha título, descrição, URL e imagem. Campos vazios são omitidos.', step2: 'Copie a marcação para o head de uma página.', step3: 'Aspas e sinais de menor e maior são escapados. A imagem não é baixada.' },
  },
)
