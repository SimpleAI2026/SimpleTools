import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Keycode info',
    description: 'Show key, code, keyCode, location, and modifiers for the key you press.',
    hint: 'Click this page, then press a key. The browser handles the event locally.',
    empty: 'No key yet.',
    usageTitle: 'How to use',
    step1: 'Focus the page and press the key you want to identify.',
    step2: 'Read key, code, and the legacy keyCode, plus Alt, Ctrl, Shift, and Meta.',
    step3: 'Copy the lines into a bug note. Nothing is sent off this device.',
  },
  {
    'zh-CN': { name: '按键信息', description: '显示所按键的 key、code、keyCode、位置和修饰键。', hint: '点一下这个页面，然后按一个键。浏览器只在本地处理这个事件。', empty: '还没有按键。', usageTitle: '使用方法', step1: '让页面获得焦点，按下要辨认的键。', step2: '查看 key、code 和旧的 keyCode，以及 Alt、Ctrl、Shift、Meta。', step3: '把这几行复制到缺陷笔记。内容不会离开这台设备。' },
    ja: { name: 'キーコード情報', description: '押したキーの key、code、keyCode、位置、修飾キーを表示します。', hint: 'このページをクリックしてからキーを押します。イベントはこのブラウザの中だけで扱います。', empty: 'まだキーがありません。', usageTitle: '使い方', step1: 'ページにフォーカスして、調べたいキーを押します。', step2: 'key、code、古い keyCode と、Alt、Ctrl、Shift、Meta を読みます。', step3: '行を不具合メモにコピーします。この端末の外には送りません。' },
    ko: { name: '키코드 정보', description: '누른 키의 key, code, keyCode, 위치, 수정 키를 보여 줍니다.', hint: '이 페이지를 클릭한 뒤 키를 누릅니다. 브라우저는 이벤트를 로컬에서만 처리합니다.', empty: '아직 키가 없습니다.', usageTitle: '사용 방법', step1: '페이지에 포커스를 두고 알아볼 키를 누릅니다.', step2: 'key, code, 예전 keyCode와 Alt, Ctrl, Shift, Meta를 읽습니다.', step3: '줄을 버그 메모에 복사합니다. 이 기기 밖으로 보내지 않습니다.' },
    de: { name: 'Tastencode', description: 'Zeigt key, code, keyCode, Position und Modifikatoren der gedrückten Taste.', hint: 'Diese Seite anklicken und dann eine Taste drücken. Der Browser verarbeitet das Ereignis lokal.', empty: 'Noch keine Taste.', usageTitle: 'Verwendung', step1: 'Die Seite fokussieren und die Taste drücken, die erkannt werden soll.', step2: 'key, code und den alten keyCode lesen, dazu Alt, Strg, Umschalt und Meta.', step3: 'Die Zeilen in eine Fehlernotiz kopieren. Nichts verlässt dieses Gerät.' },
    fr: { name: 'Code de touche', description: 'Affiche key, code, keyCode, l’emplacement et les modificateurs de la touche pressée.', hint: 'Cliquez cette page, puis appuyez sur une touche. Le navigateur traite l’événement ici.', empty: 'Aucune touche pour l’instant.', usageTitle: 'Mode d’emploi', step1: 'Donnez le focus à la page et appuyez sur la touche à identifier.', step2: 'Lisez key, code et l’ancien keyCode, plus Alt, Ctrl, Maj et Meta.', step3: 'Copiez les lignes dans une note de bogue. Rien ne quitte cet appareil.' },
    es: { name: 'Código de tecla', description: 'Muestra key, code, keyCode, la ubicación y los modificadores de la tecla pulsada.', hint: 'Haz clic en esta página y pulsa una tecla. El navegador trata el evento aquí.', empty: 'Todavía no hay tecla.', usageTitle: 'Cómo usarlo', step1: 'Enfoca la página y pulsa la tecla que quieres identificar.', step2: 'Lee key, code y el keyCode antiguo, más Alt, Ctrl, Mayús y Meta.', step3: 'Copia las líneas a una nota de fallo. Nada sale de este dispositivo.' },
    'pt-BR': { name: 'Código da tecla', description: 'Mostra key, code, keyCode, a posição e os modificadores da tecla pressionada.', hint: 'Clique nesta página e pressione uma tecla. O navegador trata o evento aqui.', empty: 'Nenhuma tecla ainda.', usageTitle: 'Como usar', step1: 'Foque a página e pressione a tecla que quer identificar.', step2: 'Leia key, code e o keyCode antigo, além de Alt, Ctrl, Shift e Meta.', step3: 'Copie as linhas para uma nota de defeito. Nada sai deste aparelho.' },
  },
)
