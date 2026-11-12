import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'YAML viewer',
    description: 'Browse one or more YAML documents as a tree and copy a path.',
    expand: 'Expand',
    collapse: 'Collapse',
    search: 'Search keys and values',
    stats: '{objects} objects, {arrays} arrays, {values} values, depth {maxDepth}',
    usageTitle: 'How to use',
    step1: 'Paste YAML. Several documents become one list.',
    step2: 'Search a key or a value and click a node to select its path.',
    step3: 'Copy the path into a note. Parsing stays in this tab.',
  },
  {
    'zh-CN': { name: 'YAML 查看', description: '把一份或多份 YAML 文档展开成树，并复制路径。', expand: '展开', collapse: '折叠', search: '搜索键和值', stats: '{objects} 个对象，{arrays} 个数组，{values} 个值，深度 {maxDepth}', usageTitle: '使用方法', step1: '粘贴 YAML。多份文档会变成一个列表。', step2: '搜索键或值，点击节点以选中它的路径。', step3: '把路径复制到笔记。解析留在这个标签页。' },
    ja: { name: 'YAML ビューア', description: '一つ以上の YAML 文書を木として見て、パスをコピーします。', expand: '展開', collapse: '折りたたむ', search: 'キーと値を検索', stats: 'オブジェクト {objects}、配列 {arrays}、値 {values}、深さ {maxDepth}', usageTitle: '使い方', step1: 'YAML を貼ります。複数文書は一つのリストになります。', step2: 'キーや値を検索し、ノードをクリックしてパスを選びます。', step3: 'パスをメモにコピーします。解析はこのタブの中です。' },
    ko: { name: 'YAML 보기', description: 'YAML 문서 하나 이상을 트리로 보고 경로를 복사합니다.', expand: '펼치기', collapse: '접기', search: '키와 값 검색', stats: '객체 {objects}, 배열 {arrays}, 값 {values}, 깊이 {maxDepth}', usageTitle: '사용 방법', step1: 'YAML을 붙입니다. 문서가 여러 개면 하나의 목록이 됩니다.', step2: '키나 값을 검색하고 노드를 클릭해 경로를 고릅니다.', step3: '경로를 메모에 복사합니다. 파싱은 이 탭에서 합니다.' },
    de: { name: 'YAML-Ansicht', description: 'Zeigt ein oder mehrere YAML-Dokumente als Baum und kopiert einen Pfad.', expand: 'Aufklappen', collapse: 'Zuklappen', search: 'Schlüssel und Werte suchen', stats: '{objects} Objekte, {arrays} Arrays, {values} Werte, Tiefe {maxDepth}', usageTitle: 'Verwendung', step1: 'YAML einfügen. Mehrere Dokumente werden zu einer Liste.', step2: 'Einen Schlüssel oder Wert suchen und einen Knoten anklicken, um seinen Pfad zu wählen.', step3: 'Den Pfad in eine Notiz kopieren. Das Parsen bleibt in diesem Tab.' },
    fr: { name: 'Visionneuse YAML', description: 'Parcourt un ou plusieurs documents YAML en arbre et copie un chemin.', expand: 'Déplier', collapse: 'Replier', search: 'Chercher clés et valeurs', stats: '{objects} objets, {arrays} tableaux, {values} valeurs, profondeur {maxDepth}', usageTitle: 'Mode d’emploi', step1: 'Collez du YAML. Plusieurs documents deviennent une liste.', step2: 'Cherchez une clé ou une valeur et cliquez un nœud pour choisir son chemin.', step3: 'Copiez le chemin dans une note. L’analyse reste dans cet onglet.' },
    es: { name: 'Visor YAML', description: 'Recorre uno o más documentos YAML como árbol y copia una ruta.', expand: 'Expandir', collapse: 'Contraer', search: 'Buscar claves y valores', stats: '{objects} objetos, {arrays} arrays, {values} valores, profundidad {maxDepth}', usageTitle: 'Cómo usarlo', step1: 'Pega YAML. Varios documentos se vuelven una lista.', step2: 'Busca una clave o un valor y haz clic en un nodo para elegir su ruta.', step3: 'Copia la ruta a una nota. El análisis se queda en esta pestaña.' },
    'pt-BR': { name: 'Visualizador YAML', description: 'Percorre um ou mais documentos YAML em árvore e copia um caminho.', expand: 'Expandir', collapse: 'Recolher', search: 'Buscar chaves e valores', stats: '{objects} objetos, {arrays} arrays, {values} valores, profundidade {maxDepth}', usageTitle: 'Como usar', step1: 'Cole YAML. Vários documentos viram uma lista.', step2: 'Busque uma chave ou um valor e clique num nó para escolher o caminho.', step3: 'Copie o caminho para uma nota. A análise fica nesta aba.' },
  },
)
