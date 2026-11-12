import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Device information',
    description: 'Show the screen, language, and hardware facts this browser already exposes.',
    note: 'These values come from this tab. The extension page uses the same browser APIs and does not add a host permission.',
    usageTitle: 'How to use',
    step1: 'Open the tool. The facts are read locally.',
    step2: 'Check the user agent, languages, screen, viewport, and timezone.',
    step3: 'Copy the block into a bug report. It does not include an account or a network address.',
  },
  {
    'zh-CN': { name: '设备信息', description: '显示这台浏览器已经提供的屏幕、语言和硬件信息。', note: '这些值来自这个标签页。扩展页面使用同样的浏览器接口，不另加主机权限。', usageTitle: '使用方法', step1: '打开工具。信息只在本地读取。', step2: '查看用户代理、语言、屏幕、视口和时区。', step3: '把这段复制到缺陷报告。它不含账号，也不含网络地址。' },
    ja: { name: '端末情報', description: 'このブラウザが既に出している画面、言語、ハードウェアの情報を表示します。', note: '値はこのタブのものです。拡張機能のページも同じブラウザ API を使い、ホスト権限は足しません。', usageTitle: '使い方', step1: 'ツールを開きます。情報はこの端末で読みます。', step2: 'ユーザーエージェント、言語、画面、ビューポート、タイムゾーンを確認します。', step3: '不具合報告にコピーします。アカウントやネットワークアドレスは含みません。' },
    ko: { name: '기기 정보', description: '이 브라우저가 이미 알려 주는 화면, 언어, 하드웨어 정보를 보여 줍니다.', note: '값은 이 탭에서 옵니다. 확장 페이지도 같은 브라우저 API를 쓰며 호스트 권한을 더하지 않습니다.', usageTitle: '사용 방법', step1: '도구를 엽니다. 정보는 로컬에서 읽습니다.', step2: '사용자 에이전트, 언어, 화면, 뷰포트, 시간대를 확인합니다.', step3: '버그 보고에 복사합니다. 계정이나 네트워크 주소는 포함하지 않습니다.' },
    de: { name: 'Geräteinformationen', description: 'Zeigt Bildschirm, Sprache und Hardware, die dieser Browser schon nennt.', note: 'Die Werte kommen aus diesem Tab. Die Erweiterungsseite nutzt dieselben Browser-APIs und fügt keine Host-Berechtigung hinzu.', usageTitle: 'Verwendung', step1: 'Das Werkzeug öffnen. Die Angaben werden lokal gelesen.', step2: 'User-Agent, Sprachen, Bildschirm, Viewport und Zeitzone prüfen.', step3: 'Den Block in einen Fehlerbericht kopieren. Er enthält kein Konto und keine Netzadresse.' },
    fr: { name: 'Informations de l’appareil', description: 'Affiche l’écran, la langue et le matériel que ce navigateur expose déjà.', note: 'Ces valeurs viennent de cet onglet. La page de l’extension utilise les mêmes API et n’ajoute pas de permission d’hôte.', usageTitle: 'Mode d’emploi', step1: 'Ouvrez l’outil. Les faits sont lus localement.', step2: 'Vérifiez l’agent utilisateur, les langues, l’écran, la fenêtre et le fuseau.', step3: 'Copiez le bloc dans un rapport de bogue. Il ne contient ni compte ni adresse réseau.' },
    es: { name: 'Información del dispositivo', description: 'Muestra la pantalla, el idioma y el hardware que este navegador ya expone.', note: 'Estos valores salen de esta pestaña. La página de la extensión usa las mismas API y no añade un permiso de host.', usageTitle: 'Cómo usarlo', step1: 'Abre la herramienta. Los datos se leen aquí.', step2: 'Revisa el agente de usuario, los idiomas, la pantalla, la ventana y la zona horaria.', step3: 'Copia el bloque a un informe de fallo. No incluye una cuenta ni una dirección de red.' },
    'pt-BR': { name: 'Informações do aparelho', description: 'Mostra a tela, o idioma e o hardware que este navegador já expõe.', note: 'Esses valores vêm desta aba. A página da extensão usa as mesmas APIs e não acrescenta uma permissão de host.', usageTitle: 'Como usar', step1: 'Abra a ferramenta. Os dados são lidos aqui.', step2: 'Confira o agente de usuário, os idiomas, a tela, a janela e o fuso.', step3: 'Copie o bloco para um relatório de defeito. Ele não inclui uma conta nem um endereço de rede.' },
  },
)
