import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'ETA calculator',
    description: 'Estimate the remaining time from work done, the total, and the elapsed seconds.',
    done: 'Done',
    total: 'Total',
    elapsed: 'Elapsed seconds',
    remaining: 'Remaining',
    finish: 'Finish',
    invalid: 'Need a positive amount done, a total at least that large, and elapsed time above zero.',
    usageTitle: 'How to use',
    step1: 'Enter how much is done, the total, and how many seconds have passed.',
    step2: 'Read the remaining time and the finish clock. The pace is assumed constant.',
    step3: 'Copy the two lines into a status note. The estimate stays on this device.',
  },
  {
    'zh-CN': { name: '剩余时间估算', description: '用已完成量、总量和已用秒数估算剩余时间。', done: '已完成', total: '总量', elapsed: '已用秒数', remaining: '剩余', finish: '完成时刻', invalid: '已完成量要大于零，总量不能更小，已用时间也要大于零。', usageTitle: '使用方法', step1: '填写已完成量、总量和已经过去的秒数。', step2: '查看剩余时间和完成时刻。速度按恒定估算。', step3: '把两行复制到状态笔记。估算留在本机。' },
    ja: { name: '残り時間の見積もり', description: '完了量、総量、経過秒から残り時間を見積もります。', done: '完了', total: '総量', elapsed: '経過秒', remaining: '残り', finish: '完了時刻', invalid: '完了量は正、総量はそれ以上、経過時間はゼロより大きくしてください。', usageTitle: '使い方', step1: '完了量、総量、経過した秒数を入れます。', step2: '残り時間と完了時刻を読みます。速度は一定とみなします。', step3: '二行を状況メモにコピーします。見積もりはこの端末に残ります。' },
    ko: { name: '남은 시간 추정', description: '완료량, 총량, 경과 초로 남은 시간을 추정합니다.', done: '완료', total: '총량', elapsed: '경과 초', remaining: '남음', finish: '완료 시각', invalid: '완료량은 0보다 크고, 총량은 그보다 작지 않으며, 경과 시간도 0보다 커야 합니다.', usageTitle: '사용 방법', step1: '완료량, 총량, 지난 초를 입력합니다.', step2: '남은 시간과 완료 시각을 읽습니다. 속도는 일정하다고 봅니다.', step3: '두 줄을 상태 메모에 복사합니다. 추정은 이 기기에 남습니다.' },
    de: { name: 'Restzeit', description: 'Schätzt die Restzeit aus erledigter Menge, Gesamtmenge und vergangenen Sekunden.', done: 'Erledigt', total: 'Gesamt', elapsed: 'Vergangene Sekunden', remaining: 'Rest', finish: 'Fertig', invalid: 'Die erledigte Menge muss positiv sein, die Gesamtmenge mindestens so groß, die Zeit größer als null.', usageTitle: 'Verwendung', step1: 'Erledigte Menge, Gesamtmenge und vergangene Sekunden eintragen.', step2: 'Restzeit und Fertig-Uhrzeit lesen. Das Tempo gilt als konstant.', step3: 'Die zwei Zeilen in eine Statusnotiz kopieren. Die Schätzung bleibt auf diesem Gerät.' },
    fr: { name: 'Estimateur de fin', description: 'Estime le temps restant à partir du fait, du total et des secondes écoulées.', done: 'Fait', total: 'Total', elapsed: 'Secondes écoulées', remaining: 'Restant', finish: 'Fin', invalid: 'Il faut une quantité faite positive, un total au moins égal, et un temps écoulé supérieur à zéro.', usageTitle: 'Mode d’emploi', step1: 'Indiquez la quantité faite, le total et les secondes déjà passées.', step2: 'Lisez le temps restant et l’heure de fin. Le rythme est supposé constant.', step3: 'Copiez les deux lignes dans une note d’état. L’estimation reste sur cet appareil.' },
    es: { name: 'Estimador de fin', description: 'Estima el tiempo restante a partir de lo hecho, el total y los segundos transcurridos.', done: 'Hecho', total: 'Total', elapsed: 'Segundos transcurridos', remaining: 'Restante', finish: 'Fin', invalid: 'Hace falta una cantidad hecha positiva, un total al menos igual y un tiempo mayor que cero.', usageTitle: 'Cómo usarlo', step1: 'Escribe lo hecho, el total y los segundos ya pasados.', step2: 'Lee el tiempo restante y la hora de fin. El ritmo se supone constante.', step3: 'Copia las dos líneas a una nota de estado. La estimación se queda en este dispositivo.' },
    'pt-BR': { name: 'Estimativa de término', description: 'Estima o tempo restante a partir do feito, do total e dos segundos decorridos.', done: 'Feito', total: 'Total', elapsed: 'Segundos decorridos', remaining: 'Restante', finish: 'Término', invalid: 'É preciso uma quantidade feita positiva, um total pelo menos igual e um tempo maior que zero.', usageTitle: 'Como usar', step1: 'Informe o feito, o total e os segundos já passados.', step2: 'Leia o tempo restante e o horário de término. O ritmo é tratado como constante.', step3: 'Copie as duas linhas para uma nota de status. A estimativa fica neste aparelho.' },
  },
)
