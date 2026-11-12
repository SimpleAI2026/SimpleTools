import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'NATO alphabet',
    description: 'Spell text with the ICAO phonetic alphabet. Digits use Zero through Nine.',
    usageTitle: 'How to use',
    step1: 'Type or paste the text you need to spell aloud.',
    step2: 'Read one word per letter. Spaces become a slash.',
    step3: 'Copy the spelling into a radio note or a message. Letters outside A–Z stay as themselves.',
  },
  {
    'zh-CN': { name: '北约音标字母', description: '用 ICAO 音标拼出文本。数字使用 Zero 到 Nine。', usageTitle: '使用方法', step1: '输入或粘贴需要口头拼读的文本。', step2: '每个字母对应一个单词。空格会变成斜杠。', step3: '把拼读复制到无线电记录或消息里。A–Z 以外的字母保持原样。' },
    ja: { name: 'NATO フォネティック', description: 'ICAO のフォネティックコードでテキストを綴ります。数字は Zero から Nine です。', usageTitle: '使い方', step1: '口頭で綴りたいテキストを入力または貼り付けます。', step2: '文字ごとに単語を読みます。空白はスラッシュになります。', step3: '無線メモやメッセージにコピーします。A–Z 以外はそのまま残します。' },
    ko: { name: 'NATO 음성 알파벳', description: 'ICAO 음성 알파벳으로 텍스트를 철자합니다. 숫자는 Zero부터 Nine입니다.', usageTitle: '사용 방법', step1: '소리 내어 철자할 텍스트를 입력하거나 붙여 넣습니다.', step2: '글자마다 단어를 읽습니다. 공백은 슬래시가 됩니다.', step3: '무전 메모나 메시지에 복사합니다. A–Z 밖의 문자는 그대로 둡니다.' },
    de: { name: 'NATO-Alphabet', description: 'Buchstabiert Text mit dem ICAO-Alphabet. Ziffern heißen Zero bis Nine.', usageTitle: 'Verwendung', step1: 'Den Text eingeben oder einfügen, der laut buchstabiert werden soll.', step2: 'Ein Wort je Buchstabe lesen. Leerzeichen werden zu einem Schrägstrich.', step3: 'Die Buchstabierung in eine Funknotiz oder eine Nachricht kopieren. Zeichen außerhalb von A–Z bleiben stehen.' },
    fr: { name: 'Alphabet OTAN', description: 'Épelle un texte avec l’alphabet phonétique OACI. Les chiffres vont de Zero à Nine.', usageTitle: 'Mode d’emploi', step1: 'Saisissez ou collez le texte à épeler à voix haute.', step2: 'Lisez un mot par lettre. Les espaces deviennent une barre oblique.', step3: 'Copiez l’épellation dans une note radio ou un message. Les signes hors A–Z restent tels quels.' },
    es: { name: 'Alfabeto OTAN', description: 'Deletrea texto con el alfabeto fonético OACI. Los dígitos van de Zero a Nine.', usageTitle: 'Cómo usarlo', step1: 'Escribe o pega el texto que hay que deletrear en voz alta.', step2: 'Lee una palabra por letra. Los espacios se vuelven una barra.', step3: 'Copia el deletreo a una nota de radio o un mensaje. Lo que no sea A–Z se queda igual.' },
    'pt-BR': { name: 'Alfabeto OTAN', description: 'Soletra texto com o alfabeto fonético OACI. Os dígitos vão de Zero a Nine.', usageTitle: 'Como usar', step1: 'Digite ou cole o texto que precisa ser soletrado em voz alta.', step2: 'Leia uma palavra por letra. Espaços viram uma barra.', step3: 'Copie a soletração para uma nota de rádio ou uma mensagem. O que não for A–Z permanece igual.' },
  },
)
