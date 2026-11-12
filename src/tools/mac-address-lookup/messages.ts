import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'MAC vendor lookup',
    description: 'Look up a MAC prefix in the bundled IEEE MA-L list. No request is sent.',
    mac: 'MAC address',
    note: 'The list is a snapshot of 24-bit MA-L assignments. 28-bit and 36-bit assignments are not included.',
    loading: 'Loading the local list…',
    none: 'No MA-L assignment for that prefix.',
    usageTitle: 'How to use',
    step1: 'Paste a MAC address. Separators are optional.',
    step2: 'Read the organization for the first three octets.',
    step3: 'Copy the name into a note. The lookup never leaves this device.',
  },
  {
    'zh-CN': { name: 'MAC 厂商查询', description: '在内置的 IEEE MA-L 列表里查 MAC 前缀。不会发出请求。', mac: 'MAC 地址', note: '这份列表是 24 位 MA-L 分配的快照，不含 28 位和 36 位分配。', loading: '正在加载本地列表…', none: '这个前缀没有 MA-L 记录。', usageTitle: '使用方法', step1: '粘贴 MAC 地址。分隔符可有可无。', step2: '查看前三个字节对应的组织。', step3: '把名称复制到笔记。查询不会离开这台设备。' },
    ja: { name: 'MAC ベンダー検索', description: '同梱の IEEE MA-L 一覧で MAC 接頭辞を探します。リクエストは送りません。', mac: 'MAC アドレス', note: '一覧は 24 ビットの MA-L 割り当てです。28 ビットと 36 ビットは含みません。', loading: 'ローカルの一覧を読み込み中…', none: 'その接頭辞の MA-L はありません。', usageTitle: '使い方', step1: 'MAC アドレスを貼ります。区切りは任意です。', step2: '先頭 3 オクテットの組織を読みます。', step3: '名称をメモにコピーします。検索はこの端末の外に出ません。' },
    ko: { name: 'MAC 제조사 조회', description: '함께 담긴 IEEE MA-L 목록에서 MAC 접두사를 찾습니다. 요청을 보내지 않습니다.', mac: 'MAC 주소', note: '목록은 24비트 MA-L 할당의 스냅샷입니다. 28비트와 36비트는 포함하지 않습니다.', loading: '로컬 목록을 읽는 중…', none: '그 접두사의 MA-L 기록이 없습니다.', usageTitle: '사용 방법', step1: 'MAC 주소를 붙입니다. 구분 기호는 없어도 됩니다.', step2: '앞의 세 옥텟에 해당하는 조직을 읽습니다.', step3: '이름을 메모에 복사합니다. 조회는 이 기기를 떠나지 않습니다.' },
    de: { name: 'MAC-Hersteller', description: 'Sucht ein MAC-Präfix in der mitgelieferten IEEE-MA-L-Liste. Es wird nichts angefragt.', mac: 'MAC-Adresse', note: 'Die Liste ist ein Stand der 24-Bit-MA-L-Einträge. 28-Bit- und 36-Bit-Einträge fehlen.', loading: 'Lokale Liste wird geladen…', none: 'Kein MA-L-Eintrag für dieses Präfix.', usageTitle: 'Verwendung', step1: 'Eine MAC-Adresse einfügen. Trenner sind optional.', step2: 'Die Organisation der ersten drei Oktette lesen.', step3: 'Den Namen in eine Notiz kopieren. Die Suche verlässt dieses Gerät nicht.' },
    fr: { name: 'Fabricant MAC', description: 'Cherche un préfixe MAC dans la liste IEEE MA-L embarquée. Aucune requête n’est envoyée.', mac: 'Adresse MAC', note: 'La liste est un instantané des attributions MA-L sur 24 bits. Les attributions 28 et 36 bits n’y sont pas.', loading: 'Chargement de la liste locale…', none: 'Aucune attribution MA-L pour ce préfixe.', usageTitle: 'Mode d’emploi', step1: 'Collez une adresse MAC. Les séparateurs sont facultatifs.', step2: 'Lisez l’organisation des trois premiers octets.', step3: 'Copiez le nom dans une note. La recherche ne quitte pas cet appareil.' },
    es: { name: 'Fabricante MAC', description: 'Busca un prefijo MAC en la lista IEEE MA-L incluida. No se envía ninguna petición.', mac: 'Dirección MAC', note: 'La lista es una copia de las asignaciones MA-L de 24 bits. No incluye las de 28 ni 36 bits.', loading: 'Cargando la lista local…', none: 'No hay una asignación MA-L para ese prefijo.', usageTitle: 'Cómo usarlo', step1: 'Pega una dirección MAC. Los separadores son opcionales.', step2: 'Lee la organización de los tres primeros octetos.', step3: 'Copia el nombre a una nota. La búsqueda no sale de este dispositivo.' },
    'pt-BR': { name: 'Fabricante MAC', description: 'Procura um prefixo MAC na lista IEEE MA-L embutida. Nenhuma requisição é enviada.', mac: 'Endereço MAC', note: 'A lista é um instantâneo das atribuições MA-L de 24 bits. Atribuições de 28 e 36 bits não entram.', loading: 'Carregando a lista local…', none: 'Não há atribuição MA-L para esse prefixo.', usageTitle: 'Como usar', step1: 'Cole um endereço MAC. Separadores são opcionais.', step2: 'Leia a organização dos três primeiros octetos.', step3: 'Copie o nome para uma nota. A busca não sai deste aparelho.' },
  },
)
