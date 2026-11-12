import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Email normalizer',
    description: 'Lowercase domains, drop plus tags, and fold Gmail dots. One address per line.',
    lowercase: 'Lowercase the local part',
    plus: 'Drop +tag',
    dots: 'Remove dots in Gmail and use gmail.com',
    usageTitle: 'How to use',
    step1: 'Paste one address per line.',
    step2: 'Turn on the folds you want. The domain is always lowercased.',
    step3: 'Copy the folded list into a dedupe step. This does not check that the mailbox exists.',
  },
  {
    'zh-CN': { name: '邮箱规范化', description: '域名小写、去掉加号标签，并折叠 Gmail 的点。每行一个地址。', lowercase: '本地部分改为小写', plus: '去掉 +标签', dots: '去掉 Gmail 里的点并改成 gmail.com', usageTitle: '使用方法', step1: '每行粘贴一个地址。', step2: '打开需要的折叠项。域名总会改成小写。', step3: '把折叠后的列表复制到去重步骤。这个工具不检查邮箱是否存在。' },
    ja: { name: 'メールアドレス正規化', description: 'ドメインを小文字にし、+タグを外し、Gmail のドットを畳みます。1 行に 1 件です。', lowercase: 'ローカル部を小文字にする', plus: '+タグを外す', dots: 'Gmail のドットを外し gmail.com にする', usageTitle: '使い方', step1: '1 行に 1 アドレスを貼ります。', step2: '必要な畳み方をオンにします。ドメインは常に小文字です。', step3: '畳んだ一覧を重複排除にコピーします。メールボックスの実在は確認しません。' },
    ko: { name: '이메일 정규화', description: '도메인을 소문자로 만들고, +태그를 지우며, Gmail 점을 접습니다. 한 줄에 하나.', lowercase: '로컬 부분을 소문자로', plus: '+태그 제거', dots: 'Gmail의 점을 지우고 gmail.com으로', usageTitle: '사용 방법', step1: '한 줄에 주소 하나를 붙여 넣습니다.', step2: '필요한 접기를 켭니다. 도메인은 항상 소문자입니다.', step3: '접힌 목록을 중복 제거 단계로 복사합니다. 사서함 존재는 확인하지 않습니다.' },
    de: { name: 'E-Mail normalisieren', description: 'Schreibt Domains klein, entfernt Plus-Tags und faltet Gmail-Punkte. Eine Adresse je Zeile.', lowercase: 'Lokalteil kleinschreiben', plus: '+Tag entfernen', dots: 'Punkte in Gmail entfernen und gmail.com verwenden', usageTitle: 'Verwendung', step1: 'Eine Adresse je Zeile einfügen.', step2: 'Die gewünschten Faltungen einschalten. Die Domain wird immer kleingeschrieben.', step3: 'Die gefaltete Liste in einen Deduplizierungsschritt kopieren. Ob das Postfach existiert, wird nicht geprüft.' },
    fr: { name: 'Normaliseur d’e-mail', description: 'Met le domaine en minuscules, retire le +tag et replie les points Gmail. Une adresse par ligne.', lowercase: 'Minuscules pour la partie locale', plus: 'Retirer le +tag', dots: 'Retirer les points Gmail et forcer gmail.com', usageTitle: 'Mode d’emploi', step1: 'Collez une adresse par ligne.', step2: 'Activez les replis voulus. Le domaine passe toujours en minuscules.', step3: 'Copiez la liste repliée vers une déduplication. L’existence de la boîte n’est pas vérifiée.' },
    es: { name: 'Normalizar correos', description: 'Pasa el dominio a minúsculas, quita la etiqueta + y pliega los puntos de Gmail. Una dirección por línea.', lowercase: 'Minúsculas en la parte local', plus: 'Quitar +etiqueta', dots: 'Quitar puntos de Gmail y usar gmail.com', usageTitle: 'Cómo usarlo', step1: 'Pega una dirección por línea.', step2: 'Activa los pliegues que quieras. El dominio siempre queda en minúsculas.', step3: 'Copia la lista plegada a un paso de deduplicado. No se comprueba que el buzón exista.' },
    'pt-BR': { name: 'Normalizar e-mails', description: 'Deixa o domínio em minúsculas, remove a tag + e dobra os pontos do Gmail. Um endereço por linha.', lowercase: 'Minúsculas na parte local', plus: 'Remover +tag', dots: 'Remover pontos do Gmail e usar gmail.com', usageTitle: 'Como usar', step1: 'Cole um endereço por linha.', step2: 'Ligue as dobras que quiser. O domínio sempre fica em minúsculas.', step3: 'Copie a lista dobrada para uma etapa de deduplicação. A existência da caixa não é verificada.' },
  },
)
