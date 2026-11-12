import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Random port generator',
    description: 'Pick unique TCP/UDP ports inside a range. Well-known ports stay out unless you include them.',
    count: 'Count',
    min: 'Minimum',
    max: 'Maximum',
    usageTitle: 'How to use',
    step1: 'Set the range. The default starts at 1024 so it skips the well-known ports.',
    step2: 'Generate a batch of unique ports.',
    step3: 'Copy one into a local service config and check that nothing else on the machine already listens there.',
  },
  {
    'zh-CN': { name: '随机端口', description: '在范围内挑选不重复的 TCP/UDP 端口。除非你把范围放低，否则不含知名端口。', count: '数量', min: '最小', max: '最大', usageTitle: '使用方法', step1: '设置范围。默认从 1024 起，跳过知名端口。', step2: '生成一批不重复的端口。', step3: '把一个端口复制到本地服务配置，并确认本机没有别的程序已经在听。' },
    ja: { name: 'ランダムポート', description: '範囲内で重複しない TCP/UDP ポートを選びます。範囲を下げない限り既知ポートは入りません。', count: '件数', min: '最小', max: '最大', usageTitle: '使い方', step1: '範囲を決めます。既定は 1024 からで、ウェルノウンポートを避けます。', step2: '重複しないポートをまとめて作ります。', step3: 'ローカルなサービスの設定にコピーし、そのマシンで既に待ち受けていないか確認します。' },
    ko: { name: '무작위 포트', description: '범위 안에서 겹치지 않는 TCP/UDP 포트를 고릅니다. 범위를 낮추지 않으면 잘 알려진 포트는 빠집니다.', count: '개수', min: '최소', max: '최대', usageTitle: '사용 방법', step1: '범위를 정합니다. 기본값은 1024부터라 잘 알려진 포트를 건너뜁니다.', step2: '겹치지 않는 포트를 여러 개 만듭니다.', step3: '로컬 서비스 설정에 복사하고, 그 기기에서 이미 듣고 있지 않은지 확인합니다.' },
    de: { name: 'Zufällige Ports', description: 'Wählt eindeutige TCP/UDP-Ports in einem Bereich. Bekannte Ports bleiben draußen, solange der Bereich sie nicht einschließt.', count: 'Anzahl', min: 'Minimum', max: 'Maximum', usageTitle: 'Verwendung', step1: 'Den Bereich setzen. Der Standard beginnt bei 1024 und lässt die bekannten Ports aus.', step2: 'Einen Stapel eindeutiger Ports erzeugen.', step3: 'Einen Port in eine lokale Dienstkonfiguration kopieren und prüfen, dass dort noch nichts lauscht.' },
    fr: { name: 'Ports aléatoires', description: 'Choisit des ports TCP/UDP uniques dans une plage. Les ports bien connus restent dehors sauf si vous les incluez.', count: 'Nombre', min: 'Minimum', max: 'Maximum', usageTitle: 'Mode d’emploi', step1: 'Réglez la plage. Par défaut elle commence à 1024 et évite les ports bien connus.', step2: 'Générez un lot de ports uniques.', step3: 'Copiez-en un dans une config locale et vérifiez que rien n’écoute déjà dessus.' },
    es: { name: 'Puertos aleatorios', description: 'Elige puertos TCP/UDP únicos dentro de un rango. Los puertos conocidos quedan fuera salvo que los incluyas.', count: 'Cantidad', min: 'Mínimo', max: 'Máximo', usageTitle: 'Cómo usarlo', step1: 'Fija el rango. Por defecto empieza en 1024 y omite los puertos bien conocidos.', step2: 'Genera un lote de puertos únicos.', step3: 'Copia uno a una config local y comprueba que nada escuche ya ahí.' },
    'pt-BR': { name: 'Portas aleatórias', description: 'Escolhe portas TCP/UDP únicas num intervalo. Portas conhecidas ficam de fora, a menos que você as inclua.', count: 'Quantidade', min: 'Mínimo', max: 'Máximo', usageTitle: 'Como usar', step1: 'Defina o intervalo. O padrão começa em 1024 e pula as portas conhecidas.', step2: 'Gere um lote de portas únicas.', step3: 'Copie uma para uma config local e confira se nada já escuta nela.' },
  },
)
