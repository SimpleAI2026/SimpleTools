import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Camera recorder',
    description: 'Take a photo or a short recording with the camera on this device.',
    note: 'The browser asks before the camera or microphone starts. The extension page does not add a host permission. Bytes stay in this tab until you download them.',
    start: 'Start camera',
    photo: 'Photo',
    record: 'Record',
    stop: 'Stop',
    usageTitle: 'How to use',
    step1: 'Start the camera and allow the prompt for this page.',
    step2: 'Save a JPEG still or a recording. The mime is the first one this browser supports.',
    step3: 'The file downloads locally. Leaving the tool stops the camera.',
  },
  {
    'zh-CN': { name: '摄像头录制', description: '用这台设备的摄像头拍照或短录。', note: '浏览器会在打开摄像头或麦克风之前询问。扩展页面不另加主机权限。字节留在这个标签页，直到你下载。', start: '打开摄像头', photo: '拍照', record: '录像', stop: '停止', usageTitle: '使用方法', step1: '打开摄像头，并允许这个页的提示。', step2: '保存一张 JPEG，或一段录像。编码用这台浏览器最先支持的一种。', step3: '文件在本地下载。离开工具会关掉摄像头。' },
    ja: { name: 'カメラ録画', description: 'この端末のカメラで写真か短い録画を撮ります。', note: 'ブラウザはカメラやマイクを始める前に確認します。拡張機能のページはホスト権限を足しません。ダウンロードするまでバイトはこのタブに残ります。', start: 'カメラを開始', photo: '写真', record: '録画', stop: '停止', usageTitle: '使い方', step1: 'カメラを開始し、このページの確認を許可します。', step2: 'JPEG の静止画か録画を保存します。形式はこのブラウザが最初に対応するものです。', step3: 'ファイルはローカルに保存されます。ツールを離れるとカメラは止まります。' },
    ko: { name: '카메라 녹화', description: '이 기기의 카메라로 사진이나 짧은 영상을 찍습니다.', note: '브라우저는 카메라나 마이크를 켜기 전에 묻습니다. 확장 페이지는 호스트 권한을 더하지 않습니다. 바이트는 다운로드할 때까지 이 탭에 남습니다.', start: '카메라 시작', photo: '사진', record: '녹화', stop: '정지', usageTitle: '사용 방법', step1: '카메라를 켜고 이 페이지의 확인을 허용합니다.', step2: 'JPEG 사진이나 녹화를 저장합니다. 형식은 이 브라우저가 먼저 지원하는 것입니다.', step3: '파일은 로컬로 받아집니다. 도구를 떠나면 카메라가 멈춥니다.' },
    de: { name: 'Kamera', description: 'Macht ein Foto oder eine kurze Aufnahme mit der Kamera dieses Geräts.', note: 'Der Browser fragt, bevor Kamera oder Mikrofon starten. Die Erweiterungsseite fügt keine Host-Berechtigung hinzu. Die Bytes bleiben in diesem Tab, bis Sie sie laden.', start: 'Kamera starten', photo: 'Foto', record: 'Aufnehmen', stop: 'Stopp', usageTitle: 'Verwendung', step1: 'Die Kamera starten und die Nachfrage dieser Seite erlauben.', step2: 'Ein JPEG oder eine Aufnahme speichern. Der Typ ist der erste, den dieser Browser kann.', step3: 'Die Datei wird lokal geladen. Beim Verlassen des Werkzeugs stoppt die Kamera.' },
    fr: { name: 'Caméra', description: 'Prend une photo ou un court enregistrement avec la caméra de cet appareil.', note: 'Le navigateur demande avant d’ouvrir la caméra ou le micro. La page de l’extension n’ajoute pas de permission d’hôte. Les octets restent dans cet onglet jusqu’au téléchargement.', start: 'Démarrer la caméra', photo: 'Photo', record: 'Enregistrer', stop: 'Arrêter', usageTitle: 'Mode d’emploi', step1: 'Démarrez la caméra et acceptez la demande de cette page.', step2: 'Enregistrez un JPEG ou une vidéo. Le type est le premier que ce navigateur prend en charge.', step3: 'Le fichier se télécharge ici. Quitter l’outil arrête la caméra.' },
    es: { name: 'Cámara', description: 'Toma una foto o una grabación corta con la cámara de este dispositivo.', note: 'El navegador pregunta antes de abrir la cámara o el micrófono. La página de la extensión no añade un permiso de host. Los bytes se quedan en esta pestaña hasta que los descargas.', start: 'Iniciar cámara', photo: 'Foto', record: 'Grabar', stop: 'Parar', usageTitle: 'Cómo usarlo', step1: 'Inicia la cámara y acepta el aviso de esta página.', step2: 'Guarda un JPEG o una grabación. El tipo es el primero que admite este navegador.', step3: 'El archivo se descarga aquí. Salir de la herramienta detiene la cámara.' },
    'pt-BR': { name: 'Câmera', description: 'Tira uma foto ou uma gravação curta com a câmera deste aparelho.', note: 'O navegador pergunta antes de abrir a câmera ou o microfone. A página da extensão não acrescenta uma permissão de host. Os bytes ficam nesta aba até o download.', start: 'Iniciar câmera', photo: 'Foto', record: 'Gravar', stop: 'Parar', usageTitle: 'Como usar', step1: 'Inicie a câmera e aceite o pedido desta página.', step2: 'Salve um JPEG ou uma gravação. O tipo é o primeiro que este navegador aceita.', step3: 'O arquivo baixa aqui. Sair da ferramenta para a câmera.' },
  },
)
