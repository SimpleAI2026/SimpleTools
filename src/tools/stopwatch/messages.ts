import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Stopwatch',
    description: 'Time an interval and record laps in the browser tab.',
    start: 'Start',
    stop: 'Stop',
    lap: 'Lap',
    reset: 'Reset',
    laps: 'Laps',
    usageTitle: 'How to use',
    step1: 'Start the clock. It uses this tab’s timer and stops when you leave the tool.',
    step2: 'Mark a lap to record the split since the previous mark.',
    step3: 'Copy the lap list into a note. Times are not stored on a server.',
  },
  {
    'zh-CN': { name: '秒表', description: '在浏览器标签里计时并记录分段。', start: '开始', stop: '停止', lap: '分段', reset: '复位', laps: '分段记录', usageTitle: '使用方法', step1: '开始计时。它用这个标签页的计时器，离开工具就会停。', step2: '点分段，记录距上一个标记的间隔。', step3: '把分段列表复制到笔记。时间不会存到服务器。' },
    ja: { name: 'ストップウォッチ', description: 'ブラウザのタブで区間を計り、ラップを残します。', start: '開始', stop: '停止', lap: 'ラップ', reset: 'リセット', laps: 'ラップ', usageTitle: '使い方', step1: '時計を開始します。このタブのタイマーを使い、ツールを離れると止まります。', step2: 'ラップで、直前の印からの区間を残します。', step3: 'ラップ一覧をメモにコピーします。時刻はサーバーに保存しません。' },
    ko: { name: '스톱워치', description: '브라우저 탭에서 구간을 재고 랩을 남깁니다.', start: '시작', stop: '정지', lap: '랩', reset: '초기화', laps: '랩', usageTitle: '사용 방법', step1: '시계를 시작합니다. 이 탭의 타이머를 쓰며, 도구를 떠나면 멈춥니다.', step2: '랩으로 이전 표시 이후의 구간을 남깁니다.', step3: '랩 목록을 메모에 복사합니다. 시간은 서버에 저장하지 않습니다.' },
    de: { name: 'Stoppuhr', description: 'Misst ein Intervall und Runden im Browser-Tab.', start: 'Start', stop: 'Stopp', lap: 'Runde', reset: 'Zurücksetzen', laps: 'Runden', usageTitle: 'Verwendung', step1: 'Die Uhr starten. Sie nutzt den Timer dieses Tabs und stoppt, wenn das Werkzeug verlassen wird.', step2: 'Eine Runde markieren, um die Zeit seit der vorigen Marke zu speichern.', step3: 'Die Rundenliste in eine Notiz kopieren. Zeiten liegen nicht auf einem Server.' },
    fr: { name: 'Chronomètre', description: 'Chronomètre un intervalle et note les tours dans l’onglet.', start: 'Démarrer', stop: 'Arrêter', lap: 'Tour', reset: 'Remettre à zéro', laps: 'Tours', usageTitle: 'Mode d’emploi', step1: 'Démarrez le chrono. Il utilise le minuteur de cet onglet et s’arrête quand vous quittez l’outil.', step2: 'Marquez un tour pour garder l’écart depuis la marque précédente.', step3: 'Copiez la liste des tours dans une note. Les temps ne vont pas sur un serveur.' },
    es: { name: 'Cronómetro', description: 'Cronometra un intervalo y anota vueltas en la pestaña.', start: 'Iniciar', stop: 'Parar', lap: 'Vuelta', reset: 'Reiniciar', laps: 'Vueltas', usageTitle: 'Cómo usarlo', step1: 'Arranca el reloj. Usa el temporizador de esta pestaña y se detiene al salir de la herramienta.', step2: 'Marca una vuelta para guardar el tramo desde la marca anterior.', step3: 'Copia la lista de vueltas a una nota. Los tiempos no van a un servidor.' },
    'pt-BR': { name: 'Cronômetro', description: 'Cronometra um intervalo e registra voltas na aba.', start: 'Iniciar', stop: 'Parar', lap: 'Volta', reset: 'Zerar', laps: 'Voltas', usageTitle: 'Como usar', step1: 'Inicie o relógio. Ele usa o timer desta aba e para quando você sai da ferramenta.', step2: 'Marque uma volta para guardar o trecho desde a marca anterior.', step3: 'Copie a lista de voltas para uma nota. Os tempos não vão para um servidor.' },
  },
)
