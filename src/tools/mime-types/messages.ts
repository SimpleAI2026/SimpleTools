import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'MIME types',
    description: 'Look up a media type or a file extension in the bundled mime-db list.',
    search: 'Type or extension, such as json or image/png',
    none: 'No matching type in the local list.',
    usageTitle: 'How to use',
    step1: 'Type an extension or part of a media type.',
    step2: 'An exact extension is listed first. The search never leaves this device.',
    step3: 'Copy the type into a header or a config. The list is the bundled mime-db snapshot.',
  },
  {
    'zh-CN': { name: 'MIME 类型', description: '在随包的 mime-db 列表里查媒体类型或扩展名。', search: '输入类型或扩展名，例如 json 或 image/png', none: '本地列表里没有匹配的类型。', usageTitle: '使用方法', step1: '输入扩展名或媒体类型的一部分。', step2: '完全匹配的扩展名排在前面。搜索不会离开这台设备。', step3: '把类型复制到请求头或配置。列表是随包的 mime-db 快照。' },
    ja: { name: 'MIME タイプ', description: '同梱の mime-db 一覧でメディアタイプや拡張子を探します。', search: 'タイプか拡張子。例 json や image/png', none: 'ローカルの一覧に一致がありません。', usageTitle: '使い方', step1: '拡張子か、メディアタイプの一部を入力します。', step2: '完全一致の拡張子が先に出ます。検索はこの端末の外に出ません。', step3: 'タイプをヘッダーや設定にコピーします。一覧は同梱の mime-db スナップショットです。' },
    ko: { name: 'MIME 유형', description: '함께 담긴 mime-db 목록에서 미디어 유형이나 확장자를 찾습니다.', search: '유형 또는 확장자, 예: json 또는 image/png', none: '로컬 목록에 맞는 유형이 없습니다.', usageTitle: '사용 방법', step1: '확장자나 미디어 유형의 일부를 입력합니다.', step2: '정확히 맞는 확장자가 먼저 나옵니다. 검색은 이 기기를 떠나지 않습니다.', step3: '유형을 헤더나 설정에 복사합니다. 목록은 함께 담긴 mime-db 스냅샷입니다.' },
    de: { name: 'MIME-Typen', description: 'Sucht einen Medientyp oder eine Endung in der mitgelieferten mime-db-Liste.', search: 'Typ oder Endung, etwa json oder image/png', none: 'Kein Treffer in der lokalen Liste.', usageTitle: 'Verwendung', step1: 'Eine Endung oder einen Teil eines Medientyps tippen.', step2: 'Eine exakte Endung steht zuerst. Die Suche verlässt dieses Gerät nicht.', step3: 'Den Typ in einen Header oder eine Konfiguration kopieren. Die Liste ist der mitgelieferte mime-db-Stand.' },
    fr: { name: 'Types MIME', description: 'Cherche un type de média ou une extension dans la liste mime-db embarquée.', search: 'Type ou extension, par exemple json ou image/png', none: 'Aucun type correspondant dans la liste locale.', usageTitle: 'Mode d’emploi', step1: 'Saisissez une extension ou une partie d’un type de média.', step2: 'Une extension exacte arrive en premier. La recherche ne quitte pas cet appareil.', step3: 'Copiez le type dans un en-tête ou une config. La liste est l’instantané mime-db embarqué.' },
    es: { name: 'Tipos MIME', description: 'Busca un tipo de medio o una extensión en la lista mime-db incluida.', search: 'Tipo o extensión, como json o image/png', none: 'No hay un tipo coincidente en la lista local.', usageTitle: 'Cómo usarlo', step1: 'Escribe una extensión o parte de un tipo de medio.', step2: 'Una extensión exacta sale primero. La búsqueda no sale de este dispositivo.', step3: 'Copia el tipo a una cabecera o una config. La lista es la copia mime-db incluida.' },
    'pt-BR': { name: 'Tipos MIME', description: 'Procura um tipo de mídia ou uma extensão na lista mime-db embutida.', search: 'Tipo ou extensão, como json ou image/png', none: 'Nenhum tipo correspondente na lista local.', usageTitle: 'Como usar', step1: 'Digite uma extensão ou parte de um tipo de mídia.', step2: 'Uma extensão exata aparece primeiro. A busca não sai deste aparelho.', step3: 'Copie o tipo para um cabeçalho ou uma config. A lista é o instantâneo mime-db embutido.' },
  },
)
