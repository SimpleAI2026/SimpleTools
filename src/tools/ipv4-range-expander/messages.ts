import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'IPv4 range expander',
    description: 'Cover an inclusive IPv4 range with the largest aligned CIDR blocks.',
    start: 'Start address',
    end: 'End address',
    invalid: 'Enter two IPv4 addresses, with the start at or before the end.',
    usageTitle: 'How to use',
    step1: 'Type the first and last address of the range, inclusive.',
    step2: 'Read the CIDR list. A single host becomes a /32.',
    step3: 'Copy the blocks into a firewall or routing note. The tool does not probe the network.',
  },
  {
    'zh-CN': { name: 'IPv4 范围展开', description: '用尽量大且对齐的 CIDR 覆盖一段闭区间 IPv4。', start: '起始地址', end: '结束地址', invalid: '请输入两个 IPv4 地址，起始地址不能晚于结束地址。', usageTitle: '使用方法', step1: '填写闭区间的首尾地址。', step2: '查看 CIDR 列表。单个主机会写成 /32。', step3: '把网段复制到防火墙或路由笔记。这个工具不会探测网络。' },
    ja: { name: 'IPv4 範囲の展開', description: '閉区間の IPv4 を、できるだけ大きく境界に揃った CIDR で覆います。', start: '開始アドレス', end: '終了アドレス', invalid: 'IPv4 を二つ入れ、開始は終了以前にしてください。', usageTitle: '使い方', step1: '範囲の最初と最後のアドレスを入れます。両端を含みます。', step2: 'CIDR の一覧を読みます。単一ホストは /32 になります。', step3: 'ファイアウォールや経路のメモにコピーします。ネットワークは調べません。' },
    ko: { name: 'IPv4 범위 전개', description: '닫힌 IPv4 구간을 최대한 크고 정렬된 CIDR로 덮습니다.', start: '시작 주소', end: '끝 주소', invalid: 'IPv4 주소 두 개를 입력하고, 시작은 끝보다 뒤일 수 없습니다.', usageTitle: '사용 방법', step1: '구간의 첫 주소와 마지막 주소를 입력합니다. 양 끝을 포함합니다.', step2: 'CIDR 목록을 읽습니다. 호스트 하나는 /32가 됩니다.', step3: '방화벽이나 라우팅 메모에 복사합니다. 네트워크를 조사하지 않습니다.' },
    de: { name: 'IPv4-Bereich', description: 'Deckt einen inklusiven IPv4-Bereich mit möglichst großen, ausgerichteten CIDR-Blöcken ab.', start: 'Startadresse', end: 'Endadresse', invalid: 'Zwei IPv4-Adressen eingeben; der Start darf nicht hinter dem Ende liegen.', usageTitle: 'Verwendung', step1: 'Erste und letzte Adresse des Bereichs eingeben, beide inklusive.', step2: 'Die CIDR-Liste lesen. Ein einzelner Host wird zu /32.', step3: 'Die Blöcke in eine Firewall- oder Routing-Notiz kopieren. Das Netz wird nicht abgefragt.' },
    fr: { name: 'Plage IPv4', description: 'Couvre une plage IPv4 inclusive avec les plus grands blocs CIDR alignés.', start: 'Adresse de début', end: 'Adresse de fin', invalid: 'Saisissez deux adresses IPv4, le début avant ou égal à la fin.', usageTitle: 'Mode d’emploi', step1: 'Indiquez la première et la dernière adresse, bornes comprises.', step2: 'Lisez la liste CIDR. Un hôte seul devient un /32.', step3: 'Copiez les blocs dans une note de pare-feu ou de routage. Le réseau n’est pas interrogé.' },
    es: { name: 'Rango IPv4', description: 'Cubre un rango IPv4 inclusivo con los bloques CIDR alineados más grandes.', start: 'Dirección inicial', end: 'Dirección final', invalid: 'Escribe dos direcciones IPv4; el inicio no puede ir después del final.', usageTitle: 'Cómo usarlo', step1: 'Escribe la primera y la última dirección, ambas incluidas.', step2: 'Lee la lista CIDR. Un solo host queda como /32.', step3: 'Copia los bloques a una nota de cortafuegos o de enrutado. No se consulta la red.' },
    'pt-BR': { name: 'Faixa IPv4', description: 'Cobre uma faixa IPv4 inclusiva com os maiores blocos CIDR alinhados.', start: 'Endereço inicial', end: 'Endereço final', invalid: 'Informe dois endereços IPv4; o início não pode vir depois do fim.', usageTitle: 'Como usar', step1: 'Informe o primeiro e o último endereço, ambos inclusos.', step2: 'Leia a lista CIDR. Um único host vira /32.', step3: 'Copie os blocos para uma nota de firewall ou roteamento. A rede não é consultada.' },
  },
)
