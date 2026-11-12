import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'File to Base64',
    description: 'Turn any local file into a Base64 data URL, and turn a data URL back into bytes.',
    drop: 'Drop a file or choose one',
    dataUrl: 'Data URL',
    paste: 'Paste a data URL to download the bytes',
    invalid: 'That text is not a Base64 data URL.',
    usageTitle: 'How to use',
    step1: 'Drop a file. The data URL is built in this tab.',
    step2: 'Copy it into a fixture, or paste a data URL back to recover the bytes.',
    step3: 'A plain data URL without Base64 is rejected. The file never leaves this device.',
  },
  {
    'zh-CN': { name: '文件与 Base64', description: '把任意本地文件变成 Base64 data URL，也能把 data URL 还原成字节。', drop: '拖入文件或选择文件', dataUrl: 'Data URL', paste: '粘贴 data URL 以下载字节', invalid: '这段文本不是 Base64 data URL。', usageTitle: '使用方法', step1: '拖入文件。data URL 在这个标签页里生成。', step2: '把它复制到夹具，或把 data URL 贴回来还原字节。', step3: '没有 Base64 的普通 data URL 会被拒绝。文件不会离开这台设备。' },
    ja: { name: 'ファイルと Base64', description: '任意のローカルファイルを Base64 の data URL にし、data URL をバイトに戻します。', drop: 'ファイルをドロップするか選ぶ', dataUrl: 'Data URL', paste: 'data URL を貼ってバイトを保存', invalid: 'そのテキストは Base64 の data URL ではありません。', usageTitle: '使い方', step1: 'ファイルをドロップします。data URL はこのタブで作ります。', step2: 'テストデータにコピーするか、data URL を貼り戻してバイトを復元します。', step3: 'Base64 でない素の data URL は拒否します。ファイルはこの端末から出ません。' },
    ko: { name: '파일과 Base64', description: '아무 로컬 파일이나 Base64 data URL로 바꾸고, data URL을 바이트로 되돌립니다.', drop: '파일을 놓거나 선택', dataUrl: 'Data URL', paste: 'data URL을 붙여 바이트 받기', invalid: '그 텍스트는 Base64 data URL이 아닙니다.', usageTitle: '사용 방법', step1: '파일을 놓습니다. data URL은 이 탭에서 만듭니다.', step2: '픽스처에 복사하거나, data URL을 다시 붙여 바이트를 복원합니다.', step3: 'Base64가 아닌 일반 data URL은 거부합니다. 파일은 이 기기를 떠나지 않습니다.' },
    de: { name: 'Datei und Base64', description: 'Macht aus einer lokalen Datei eine Base64-Data-URL und aus einer Data-URL wieder Bytes.', drop: 'Datei ablegen oder wählen', dataUrl: 'Data-URL', paste: 'Data-URL einfügen, um die Bytes zu laden', invalid: 'Dieser Text ist keine Base64-Data-URL.', usageTitle: 'Verwendung', step1: 'Eine Datei ablegen. Die Data-URL entsteht in diesem Tab.', step2: 'Sie in ein Fixture kopieren oder eine Data-URL zurückeinfügen, um die Bytes zu holen.', step3: 'Eine Data-URL ohne Base64 wird abgelehnt. Die Datei verlässt dieses Gerät nicht.' },
    fr: { name: 'Fichier et Base64', description: 'Transforme un fichier local en data URL Base64, et une data URL en octets.', drop: 'Déposez un fichier ou choisissez-le', dataUrl: 'Data URL', paste: 'Collez une data URL pour récupérer les octets', invalid: 'Ce texte n’est pas une data URL Base64.', usageTitle: 'Mode d’emploi', step1: 'Déposez un fichier. La data URL est construite dans cet onglet.', step2: 'Copiez-la dans un jeu d’essai, ou collez une data URL pour retrouver les octets.', step3: 'Une data URL sans Base64 est refusée. Le fichier ne quitte pas cet appareil.' },
    es: { name: 'Archivo y Base64', description: 'Convierte un archivo local en un data URL Base64 y un data URL de vuelta en bytes.', drop: 'Suelta un archivo o elígelo', dataUrl: 'Data URL', paste: 'Pega un data URL para descargar los bytes', invalid: 'Ese texto no es un data URL Base64.', usageTitle: 'Cómo usarlo', step1: 'Suelta un archivo. El data URL se arma en esta pestaña.', step2: 'Cópialo a un fixture, o pega un data URL para recuperar los bytes.', step3: 'Un data URL sin Base64 se rechaza. El archivo no sale de este dispositivo.' },
    'pt-BR': { name: 'Arquivo e Base64', description: 'Transforma um arquivo local em um data URL Base64 e um data URL de volta em bytes.', drop: 'Solte um arquivo ou escolha um', dataUrl: 'Data URL', paste: 'Cole um data URL para baixar os bytes', invalid: 'Esse texto não é um data URL Base64.', usageTitle: 'Como usar', step1: 'Solte um arquivo. O data URL é montado nesta aba.', step2: 'Copie-o para um fixture, ou cole um data URL para recuperar os bytes.', step3: 'Um data URL sem Base64 é recusado. O arquivo não sai deste aparelho.' },
  },
)
