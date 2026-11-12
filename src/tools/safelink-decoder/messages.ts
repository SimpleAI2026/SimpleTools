import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Safe Links decoder',
    description: 'Unwrap Outlook Safe Links back to the original URL. No request is sent.',
    usageTitle: 'How to use',
    step1: 'Paste one Safe Link per line.',
    step2: 'Read the original URL. Nested wrappers are peeled off locally.',
    step3: 'Copy the URL only after you recognize the host. This tool does not visit it.',
  },
  {
    'zh-CN': { name: 'Safe Links 还原', description: '把 Outlook Safe Links 还原成原始网址。不会发出请求。', usageTitle: '使用方法', step1: '每行粘贴一条 Safe Link。', step2: '查看原始网址。嵌套包装会在本地剥掉。', step3: '确认主机名之后再复制。这个工具不会访问该网址。' },
    ja: { name: 'Safe Links の復元', description: 'Outlook の Safe Links を元の URL に戻します。リクエストは送りません。', usageTitle: '使い方', step1: '1 行に 1 つの Safe Link を貼ります。', step2: '元の URL を読みます。入れ子の包みもこの端末で外します。', step3: 'ホストを確認してからコピーします。このツールはその URL を開きません。' },
    ko: { name: 'Safe Links 복원', description: 'Outlook Safe Links를 원래 URL로 되돌립니다. 요청을 보내지 않습니다.', usageTitle: '사용 방법', step1: '한 줄에 Safe Link 하나를 붙여 넣습니다.', step2: '원래 URL을 읽습니다. 중첩된 포장도 이 기기에서 벗깁니다.', step3: '호스트를 확인한 뒤 복사합니다. 이 도구는 그 주소를 방문하지 않습니다.' },
    de: { name: 'Safe Links entschlüsseln', description: 'Holt die ursprüngliche URL aus Outlook Safe Links. Es wird nichts angefragt.', usageTitle: 'Verwendung', step1: 'Einen Safe Link pro Zeile einfügen.', step2: 'Die ursprüngliche URL lesen. Verschachtelte Hüllen werden lokal entfernt.', step3: 'Die URL erst kopieren, wenn der Host bekannt ist. Dieses Werkzeug ruft sie nicht auf.' },
    fr: { name: 'Décodeur Safe Links', description: 'Retrouve l’URL d’origine d’un lien Outlook Safe Links. Aucune requête n’est envoyée.', usageTitle: 'Mode d’emploi', step1: 'Collez un Safe Link par ligne.', step2: 'Lisez l’URL d’origine. Les emballages imbriqués sont retirés ici.', step3: 'Copiez l’URL seulement si vous reconnaissez l’hôte. Cet outil ne l’ouvre pas.' },
    es: { name: 'Decodificador Safe Links', description: 'Recupera la URL original de un enlace Outlook Safe Links. No se envía ninguna petición.', usageTitle: 'Cómo usarlo', step1: 'Pega un Safe Link por línea.', step2: 'Lee la URL original. Las capas anidadas se quitan aquí.', step3: 'Copia la URL solo si reconoces el host. Esta herramienta no la visita.' },
    'pt-BR': { name: 'Decodificador Safe Links', description: 'Recupera a URL original de um link Outlook Safe Links. Nenhuma requisição é enviada.', usageTitle: 'Como usar', step1: 'Cole um Safe Link por linha.', step2: 'Leia a URL original. Camadas aninhadas são removidas aqui.', step3: 'Copie a URL só se reconhecer o host. Esta ferramenta não a visita.' },
  },
)
