import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'IBAN validator',
    description: 'Check an IBAN with the mod-97 checksum and a local length table.',
    usageTitle: 'How to use',
    step1: 'Paste an IBAN. Spaces are ignored.',
    step2: 'Read the country, the check digits, the BBAN, and whether the checksum matches.',
    step3: 'A country missing from the length table can still pass the checksum and is marked unknown. This does not ask a bank.',
  },
  {
    'zh-CN': { name: 'IBAN 校验', description: '用 mod-97 校验和本地长度表检查 IBAN。', usageTitle: '使用方法', step1: '粘贴 IBAN。空格会被忽略。', step2: '查看国家、校验位、BBAN，以及校验和是否相符。', step3: '长度表里没有的国家仍可能通过校验和，并标成未知。这个工具不会询问银行。' },
    ja: { name: 'IBAN 検証', description: 'mod-97 とローカルな長さ表で IBAN を確認します。', usageTitle: '使い方', step1: 'IBAN を貼ります。空白は無視します。', step2: '国、検査数字、BBAN、チェックサムの一致を読みます。', step3: '長さ表に無い国でもチェックサムは通り得て、未知と出ます。銀行には問い合わせません。' },
    ko: { name: 'IBAN 검증', description: 'mod-97과 로컬 길이 표로 IBAN을 확인합니다.', usageTitle: '사용 방법', step1: 'IBAN을 붙입니다. 공백은 무시합니다.', step2: '국가, 검사 숫자, BBAN, 체크섬 일치를 읽습니다.', step3: '길이 표에 없는 나라도 체크섬은 통과할 수 있고 알 수 없음으로 표시됩니다. 은행에 묻지 않습니다.' },
    de: { name: 'IBAN-Prüfung', description: 'Prüft eine IBAN mit der Mod-97-Prüfsumme und einer lokalen Längentabelle.', usageTitle: 'Verwendung', step1: 'Eine IBAN einfügen. Leerzeichen werden ignoriert.', step2: 'Land, Prüfzeichen, BBAN und die Prüfsumme lesen.', step3: 'Ein Land außerhalb der Tabelle kann die Prüfsumme trotzdem bestehen und gilt als unbekannt. Es wird keine Bank gefragt.' },
    fr: { name: 'Validateur IBAN', description: 'Vérifie un IBAN avec la somme mod-97 et une table de longueurs locale.', usageTitle: 'Mode d’emploi', step1: 'Collez un IBAN. Les espaces sont ignorés.', step2: 'Lisez le pays, les chiffres de contrôle, le BBAN et la somme.', step3: 'Un pays absent de la table peut quand même passer la somme et est marqué inconnu. Aucune banque n’est interrogée.' },
    es: { name: 'Validador IBAN', description: 'Comprueba un IBAN con la suma mod-97 y una tabla local de longitudes.', usageTitle: 'Cómo usarlo', step1: 'Pega un IBAN. Los espacios se ignoran.', step2: 'Lee el país, los dígitos de control, el BBAN y la suma.', step3: 'Un país que no está en la tabla puede pasar la suma y se marca como desconocido. No se consulta a un banco.' },
    'pt-BR': { name: 'Validador de IBAN', description: 'Confere um IBAN com a soma mod-97 e uma tabela local de tamanhos.', usageTitle: 'Como usar', step1: 'Cole um IBAN. Espaços são ignorados.', step2: 'Leia o país, os dígitos de controle, o BBAN e a soma.', step3: 'Um país fora da tabela ainda pode passar na soma e fica marcado como desconhecido. Nenhum banco é consultado.' },
  },
)
