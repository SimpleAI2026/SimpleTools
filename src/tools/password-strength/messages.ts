import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Password strength',
    description: 'Estimate entropy from the character classes you used. Nothing is stored.',
    password: 'Password',
    note: 'The guess time assumes 10 billion tries per second and a charset of lower, upper, digits, and symbols. It does not know leaked passwords.',
    usageTitle: 'How to use',
    step1: 'Type a password. It is not saved and not sent.',
    step2: 'Read the entropy and the rough offline time.',
    step3: 'Copy the numbers into a note if you need them. Prefer a longer mix of classes.',
  },
  {
    'zh-CN': { name: '密码强度', description: '按所用字符类别估算熵。不会保存密码。', password: '密码', note: '猜测时间按每秒一百亿次、字符集为大小写、数字和符号来估算。它不知道已泄露的密码。', usageTitle: '使用方法', step1: '输入密码。它不会被保存，也不会送出。', step2: '查看熵和粗略的离线猜测时间。', step3: '需要的话把数字复制到笔记。更长、类别更多会更好。' },
    ja: { name: 'パスワード強度', description: '使った文字種からエントロピーを見積もります。保存しません。', password: 'パスワード', note: '推測時間は毎秒100億回、文字種は小文字・大文字・数字・記号です。漏えい済みパスワードは知りません。', usageTitle: '使い方', step1: 'パスワードを入力します。保存も送信もしません。', step2: 'エントロピーと大まかなオフライン時間を読みます。', step3: '必要なら数字をメモにコピーします。長く、文字種が多いほど有利です。' },
    ko: { name: '비밀번호 강도', description: '쓴 문자 종류로 엔트로피를 추정합니다. 저장하지 않습니다.', password: '비밀번호', note: '추측 시간은 초당 100억 회, 문자 집합은 소문자, 대문자, 숫자, 기호입니다. 유출된 비밀번호는 모릅니다.', usageTitle: '사용 방법', step1: '비밀번호를 입력합니다. 저장하거나 보내지 않습니다.', step2: '엔트로피와 대략적인 오프라인 시간을 읽습니다.', step3: '필요하면 숫자를 메모에 복사합니다. 더 길고 종류가 많을수록 낫습니다.' },
    de: { name: 'Passwortstärke', description: 'Schätzt die Entropie aus den genutzten Zeichenklassen. Nichts wird gespeichert.', password: 'Passwort', note: 'Die Ratezeit nimmt 10 Milliarden Versuche je Sekunde und Klein-, Großbuchstaben, Ziffern und Symbole an. Geleakte Passwörter kennt sie nicht.', usageTitle: 'Verwendung', step1: 'Ein Passwort eintippen. Es wird weder gespeichert noch gesendet.', step2: 'Entropie und die grobe Offline-Zeit lesen.', step3: 'Die Zahlen bei Bedarf in eine Notiz kopieren. Länger und gemischter ist besser.' },
    fr: { name: 'Force du mot de passe', description: 'Estime l’entropie d’après les classes de caractères utilisées. Rien n’est enregistré.', password: 'Mot de passe', note: 'Le temps suppose 10 milliards d’essais par seconde et un jeu minuscules, majuscules, chiffres et symboles. Il ignore les mots de passe déjà divulgués.', usageTitle: 'Mode d’emploi', step1: 'Saisissez un mot de passe. Il n’est ni enregistré ni envoyé.', step2: 'Lisez l’entropie et le temps hors ligne approximatif.', step3: 'Copiez les nombres dans une note si besoin. Plus long et plus mélangé vaut mieux.' },
    es: { name: 'Fortaleza de la contraseña', description: 'Estima la entropía según las clases de caracteres usadas. No se guarda nada.', password: 'Contraseña', note: 'El tiempo supone 10 mil millones de intentos por segundo y un juego de minúsculas, mayúsculas, dígitos y símbolos. No conoce contraseñas filtradas.', usageTitle: 'Cómo usarlo', step1: 'Escribe una contraseña. No se guarda ni se envía.', step2: 'Lee la entropía y el tiempo aproximado sin conexión.', step3: 'Copia los números a una nota si los necesitas. Más larga y más mezclada es mejor.' },
    'pt-BR': { name: 'Força da senha', description: 'Estima a entropia pelas classes de caracteres usadas. Nada é gravado.', password: 'Senha', note: 'O tempo supõe 10 bilhões de tentativas por segundo e um conjunto de minúsculas, maiúsculas, dígitos e símbolos. Não conhece senhas vazadas.', usageTitle: 'Como usar', step1: 'Digite uma senha. Ela não é gravada nem enviada.', step2: 'Leia a entropia e o tempo aproximado offline.', step3: 'Copie os números para uma nota se precisar. Mais longa e mais misturada é melhor.' },
  },
)
