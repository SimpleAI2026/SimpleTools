import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Basic auth header',
    description: 'Build and decode an HTTP Basic Authorization header on this device.',
    username: 'Username',
    password: 'Password',
    decode: 'Decode a header',
    invalid: 'That is not a Basic header.',
    usageTitle: 'How to use',
    step1: 'Enter the username and password. The header is built locally.',
    step2: 'Copy the Authorization line into a request or a fixture.',
    step3: 'Paste a header back here to read it. Do not send the password to a shared chat.',
  },
  {
    'zh-CN': { name: 'Basic 认证头', description: '在本机生成并解析 HTTP Basic Authorization 头。', username: '用户名', password: '密码', decode: '解析请求头', invalid: '这不是 Basic 请求头。', usageTitle: '使用方法', step1: '填写用户名和密码。请求头只在本机生成。', step2: '把 Authorization 行复制到请求或夹具。', step3: '把请求头贴回来查看内容。不要把密码发到共享对话。' },
    ja: { name: 'Basic 認証ヘッダー', description: 'HTTP Basic の Authorization ヘッダーをこの端末で作り、読み戻します。', username: 'ユーザー名', password: 'パスワード', decode: 'ヘッダーを解読', invalid: 'Basic ヘッダーではありません。', usageTitle: '使い方', step1: 'ユーザー名とパスワードを入力します。ヘッダーはこの端末で作ります。', step2: 'Authorization 行をリクエストやテストデータにコピーします。', step3: 'ヘッダーをここに戻して中身を見ます。パスワードは共有チャットに置かないでください。' },
    ko: { name: 'Basic 인증 헤더', description: 'HTTP Basic Authorization 헤더를 이 기기에서 만들고 해석합니다.', username: '사용자 이름', password: '비밀번호', decode: '헤더 해석', invalid: 'Basic 헤더가 아닙니다.', usageTitle: '사용 방법', step1: '사용자 이름과 비밀번호를 입력합니다. 헤더는 이 기기에서 만듭니다.', step2: 'Authorization 줄을 요청이나 픽스처에 복사합니다.', step3: '헤더를 여기에 붙여 내용을 봅니다. 비밀번호는 공유 대화에 올리지 마세요.' },
    de: { name: 'Basic-Auth-Header', description: 'Erzeugt und liest einen HTTP-Basic-Authorization-Header auf diesem Gerät.', username: 'Benutzername', password: 'Passwort', decode: 'Header lesen', invalid: 'Das ist kein Basic-Header.', usageTitle: 'Verwendung', step1: 'Benutzername und Passwort eingeben. Der Header entsteht lokal.', step2: 'Die Authorization-Zeile in eine Anfrage oder ein Fixture kopieren.', step3: 'Einen Header hier wieder einfügen. Das Passwort nicht in einen geteilten Chat legen.' },
    fr: { name: 'En-tête Basic', description: 'Construit et lit un en-tête HTTP Authorization Basic sur cet appareil.', username: 'Nom d’utilisateur', password: 'Mot de passe', decode: 'Décoder un en-tête', invalid: 'Ce n’est pas un en-tête Basic.', usageTitle: 'Mode d’emploi', step1: 'Saisissez le nom et le mot de passe. L’en-tête est créé localement.', step2: 'Copiez la ligne Authorization dans une requête ou un jeu d’essai.', step3: 'Collez un en-tête ici pour le lire. Ne partagez pas le mot de passe.' },
    es: { name: 'Cabecera Basic', description: 'Crea y lee una cabecera HTTP Authorization Basic en este dispositivo.', username: 'Usuario', password: 'Contraseña', decode: 'Decodificar una cabecera', invalid: 'Eso no es una cabecera Basic.', usageTitle: 'Cómo usarlo', step1: 'Escribe el usuario y la contraseña. La cabecera se crea aquí.', step2: 'Copia la línea Authorization a una petición o a un fixture.', step3: 'Pega una cabecera aquí para leerla. No compartas la contraseña.' },
    'pt-BR': { name: 'Cabeçalho Basic', description: 'Monta e lê um cabeçalho HTTP Authorization Basic neste aparelho.', username: 'Usuário', password: 'Senha', decode: 'Decodificar um cabeçalho', invalid: 'Isso não é um cabeçalho Basic.', usageTitle: 'Como usar', step1: 'Digite o usuário e a senha. O cabeçalho é criado aqui.', step2: 'Copie a linha Authorization para uma requisição ou um fixture.', step3: 'Cole um cabeçalho aqui para lê-lo. Não compartilhe a senha.' },
  },
)
