import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'MAC address generator',
    description: 'Generate random MAC addresses with an optional prefix and separator.',
    prefix: 'Prefix',
    separator: 'Separator',
    none: 'None',
    count: 'Count',
    upper: 'Uppercase',
    local: 'Locally administered when no prefix',
    usageTitle: 'How to use',
    step1: 'Leave the prefix empty or type the bytes you want to keep, such as AC:DE:48.',
    step2: 'Choose the separator and generate a batch.',
    step3: 'Copy an address into a lab config. These are random values, not addresses from a registry.',
  },
  {
    'zh-CN': { name: 'MAC 地址生成', description: '生成随机 MAC 地址，可指定前缀和分隔符。', prefix: '前缀', separator: '分隔符', none: '无', count: '数量', upper: '大写', local: '没有前缀时标记为本机管理', usageTitle: '使用方法', step1: '前缀留空，或填写要保留的字节，例如 AC:DE:48。', step2: '选择分隔符并生成一批地址。', step3: '把地址复制到实验配置。这是随机值，不是地址注册库里的记录。' },
    ja: { name: 'MAC アドレス生成', description: '任意の接頭辞と区切りでランダムな MAC アドレスを作ります。', prefix: '接頭辞', separator: '区切り', none: 'なし', count: '件数', upper: '大文字', local: '接頭辞が無いときはローカル管理ビットを立てる', usageTitle: '使い方', step1: '接頭辞を空にするか、残したいバイト（例 AC:DE:48）を入れます。', step2: '区切りを選んでまとめて生成します。', step3: '実験用の設定にコピーします。登録簿の実在アドレスではありません。' },
    ko: { name: 'MAC 주소 생성', description: '접두사와 구분 기호를 정해 무작위 MAC 주소를 만듭니다.', prefix: '접두사', separator: '구분 기호', none: '없음', count: '개수', upper: '대문자', local: '접두사가 없으면 로컬 관리 비트 설정', usageTitle: '사용 방법', step1: '접두사를 비우거나 남길 바이트(예: AC:DE:48)를 입력합니다.', step2: '구분 기호를 고르고 여러 개를 만듭니다.', step3: '실험 설정에 복사합니다. 등록부의 실제 주소가 아닙니다.' },
    de: { name: 'MAC-Adressen', description: 'Erzeugt zufällige MAC-Adressen mit optionalem Präfix und Trenner.', prefix: 'Präfix', separator: 'Trenner', none: 'Keiner', count: 'Anzahl', upper: 'Großbuchstaben', local: 'Lokal verwaltet, wenn kein Präfix gesetzt ist', usageTitle: 'Verwendung', step1: 'Das Präfix leer lassen oder Bytes vorgeben, etwa AC:DE:48.', step2: 'Den Trenner wählen und einen Stapel erzeugen.', step3: 'Eine Adresse in eine Labor-Konfiguration kopieren. Das sind Zufallswerte, kein Registereintrag.' },
    fr: { name: 'Générateur MAC', description: 'Génère des adresses MAC aléatoires, avec préfixe et séparateur facultatifs.', prefix: 'Préfixe', separator: 'Séparateur', none: 'Aucun', count: 'Nombre', upper: 'Majuscules', local: 'Bit local si aucun préfixe', usageTitle: 'Mode d’emploi', step1: 'Laissez le préfixe vide ou indiquez les octets à garder, par exemple AC:DE:48.', step2: 'Choisissez le séparateur et générez un lot.', step3: 'Copiez une adresse dans une config de labo. Ce sont des valeurs aléatoires, pas une fiche de registre.' },
    es: { name: 'Generador MAC', description: 'Genera direcciones MAC aleatorias, con prefijo y separador opcionales.', prefix: 'Prefijo', separator: 'Separador', none: 'Ninguno', count: 'Cantidad', upper: 'Mayúsculas', local: 'Administrada localmente si no hay prefijo', usageTitle: 'Cómo usarlo', step1: 'Deja el prefijo vacío o escribe los bytes que quieres conservar, como AC:DE:48.', step2: 'Elige el separador y genera un lote.', step3: 'Copia una dirección a una config de laboratorio. Son valores aleatorios, no un registro oficial.' },
    'pt-BR': { name: 'Gerador de MAC', description: 'Gera endereços MAC aleatórios, com prefixo e separador opcionais.', prefix: 'Prefixo', separator: 'Separador', none: 'Nenhum', count: 'Quantidade', upper: 'Maiúsculas', local: 'Administrado localmente se não houver prefixo', usageTitle: 'Como usar', step1: 'Deixe o prefixo vazio ou informe os bytes a manter, como AC:DE:48.', step2: 'Escolha o separador e gere um lote.', step3: 'Copie um endereço para uma config de laboratório. São valores aleatórios, não um registro oficial.' },
  },
)
