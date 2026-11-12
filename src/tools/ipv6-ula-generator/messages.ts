import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'IPv6 ULA generator',
    description: 'Build a local IPv6 prefix with the RFC 4193 fd00::/8 method.',
    note: 'The 40-bit global ID is the start of a SHA-1 over the current time and random bytes. Nothing is published.',
    prefix: '/48 prefix',
    subnet: 'First /64',
    usageTitle: 'How to use',
    step1: 'Generate a prefix. Each click uses fresh random bytes.',
    step2: 'Copy the /48 into a lab network plan, or the /64 if you only need one subnet.',
    step3: 'Treat it as a local prefix. It is not registered and must not be announced on the public Internet.',
  },
  {
    'zh-CN': { name: 'IPv6 ULA 生成', description: '按 RFC 4193 的 fd00::/8 方法生成本地 IPv6 前缀。', note: '40 位全局 ID 取自当前时间和随机字节的 SHA-1 开头。不会对外发布。', prefix: '/48 前缀', subnet: '第一个 /64', usageTitle: '使用方法', step1: '生成前缀。每次点击都使用新的随机字节。', step2: '把 /48 复制到实验网规划，或在只要一个子网时复制 /64。', step3: '把它当作本地前缀。它没有注册，也不应公布到公网。' },
    ja: { name: 'IPv6 ULA 生成', description: 'RFC 4193 の fd00::/8 方式でローカルな IPv6 プレフィックスを作ります。', note: '40 ビットのグローバル ID は、現在時刻と乱数の SHA-1 の先頭です。公開はしません。', prefix: '/48 プレフィックス', subnet: '最初の /64', usageTitle: '使い方', step1: 'プレフィックスを生成します。クリックごとに新しい乱数を使います。', step2: '実験網には /48 を、サブネットが一つなら /64 をコピーします。', step3: 'ローカルなプレフィックスとして扱います。登録されておらず、公衆インターネットに広告しないでください。' },
    ko: { name: 'IPv6 ULA 생성', description: 'RFC 4193의 fd00::/8 방식으로 로컬 IPv6 접두사를 만듭니다.', note: '40비트 전역 ID는 현재 시각과 난수에 대한 SHA-1의 앞부분입니다. 게시하지 않습니다.', prefix: '/48 접두사', subnet: '첫 /64', usageTitle: '사용 방법', step1: '접두사를 만듭니다. 클릭마다 새 난수를 씁니다.', step2: '실험망에는 /48을, 서브넷이 하나면 /64를 복사합니다.', step3: '로컬 접두사로 다룹니다. 등록되지 않았으며 공용 인터넷에 광고하면 안 됩니다.' },
    de: { name: 'IPv6-ULA-Generator', description: 'Baut ein lokales IPv6-Präfix nach der fd00::/8-Methode aus RFC 4193.', note: 'Die 40-Bit-Global-ID ist der Anfang eines SHA-1 über die aktuelle Zeit und Zufallsbytes. Nichts wird veröffentlicht.', prefix: '/48-Präfix', subnet: 'Erstes /64', usageTitle: 'Verwendung', step1: 'Ein Präfix erzeugen. Jeder Klick nutzt neue Zufallsbytes.', step2: 'Das /48 in einen Laborplan kopieren, oder das /64, wenn nur ein Subnetz nötig ist.', step3: 'Es als lokales Präfix behandeln. Es ist nicht registriert und darf nicht ins öffentliche Internet angekündigt werden.' },
    fr: { name: 'Générateur ULA IPv6', description: 'Construit un préfixe IPv6 local selon la méthode fd00::/8 du RFC 4193.', note: 'L’identifiant global de 40 bits est le début d’un SHA-1 sur l’heure et des octets aléatoires. Rien n’est publié.', prefix: 'Préfixe /48', subnet: 'Premier /64', usageTitle: 'Mode d’emploi', step1: 'Générez un préfixe. Chaque clic utilise de nouveaux octets aléatoires.', step2: 'Copiez le /48 dans un plan de labo, ou le /64 s’il ne vous faut qu’un sous-réseau.', step3: 'Traitez-le comme un préfixe local. Il n’est pas enregistré et ne doit pas être annoncé sur Internet.' },
    es: { name: 'Generador ULA IPv6', description: 'Arma un prefijo IPv6 local con el método fd00::/8 del RFC 4193.', note: 'El ID global de 40 bits es el inicio de un SHA-1 sobre la hora y bytes aleatorios. No se publica nada.', prefix: 'Prefijo /48', subnet: 'Primer /64', usageTitle: 'Cómo usarlo', step1: 'Genera un prefijo. Cada clic usa bytes aleatorios nuevos.', step2: 'Copia el /48 a un plan de laboratorio, o el /64 si solo necesitas una subred.', step3: 'Trátalo como prefijo local. No está registrado y no debe anunciarse en Internet público.' },
    'pt-BR': { name: 'Gerador de ULA IPv6', description: 'Monta um prefixo IPv6 local pelo método fd00::/8 do RFC 4193.', note: 'O ID global de 40 bits é o começo de um SHA-1 sobre a hora e bytes aleatórios. Nada é publicado.', prefix: 'Prefixo /48', subnet: 'Primeiro /64', usageTitle: 'Como usar', step1: 'Gere um prefixo. Cada clique usa bytes aleatórios novos.', step2: 'Copie o /48 para um plano de laboratório, ou o /64 se precisar de só uma sub-rede.', step3: 'Trate-o como prefixo local. Ele não é registrado e não deve ser anunciado na Internet pública.' },
  },
)
