export default {
  'zh-CN': {
    name: '活动 UTM 链接', description: '按命名规则批量写入 UTM，并保留原有参数和锚点。', disclaimer: '不发送点击，也不写入个人数据。中文只编码一次。',
    urls: '落地页链接（每行一个）', urlsHint: 'https://example.com/page', duplicatePolicy: '已有 UTM 参数', overwrite: '覆盖旧值', keep: '保留旧值', flag: '标记为问题', generatedLinks: '生成的链接',
    usageTitle: '使用方法', step1: '每行粘贴一个落地页链接，并填写 source、medium、campaign 等参数。', step2: '选择已有 UTM 参数的处理方式，检查原查询参数和锚点是否保留。', step3: '逐条复制或下载 CSV，放入活动计划前再核对落地页。',
  },
  en: {
    name: 'Campaign UTM links', description: 'Apply UTM names in bulk while keeping the original query and hash.', disclaimer: 'No click is sent and no personal data is added. Text is encoded once.',
    urls: 'Landing URLs (one per line)', urlsHint: 'https://example.com/page', duplicatePolicy: 'Existing UTM parameters', overwrite: 'Overwrite old values', keep: 'Keep old values', flag: 'Flag as an issue', generatedLinks: 'Generated links',
    usageTitle: 'How to use', step1: 'Paste one landing URL per line and enter source, medium, campaign, and optional values.', step2: 'Choose how existing UTM values are handled and check the original query and hash.', step3: 'Copy each link or download CSV, then verify the landing page before launch.',
  },
  ja: {
    name: 'キャンペーンUTM', description: '元のクエリとハッシュを保ったまま UTM を一括設定します。', disclaimer: 'クリック送信や個人データ追加はなく、文字は一度だけ符号化します。',
    urls: 'リンク先URL（1行に1件）', urlsHint: 'https://example.com/page', duplicatePolicy: '既存のUTMパラメータ', overwrite: '古い値を上書き', keep: '古い値を保持', flag: '問題として記録', generatedLinks: '生成されたリンク',
    usageTitle: '使い方', step1: '1行に1つURLを貼り、source、medium、campaignなどを入力します。', step2: '既存UTMの扱いを選び、元のクエリとハッシュを確認します。', step3: '各リンクをコピーするかCSVを保存し、公開前にリンク先を確認します。',
  },
  ko: {
    name: '캠페인 UTM 링크', description: '원래 쿼리와 해시를 유지하면서 UTM을 일괄 적용합니다.', disclaimer: '클릭을 추적하지 않고 개인정보를 추가하지 않으며 문자는 한 번만 인코딩합니다.',
    urls: '랜딩 URL(줄당 하나)', urlsHint: 'https://example.com/page', duplicatePolicy: '기존 UTM 매개변수', overwrite: '기존 값 덮어쓰기', keep: '기존 값 유지', flag: '문제로 표시', generatedLinks: '생성된 링크',
    usageTitle: '사용 방법', step1: '줄당 URL 하나를 붙여 넣고 source, medium, campaign 등을 입력합니다.', step2: '기존 UTM 처리 방법을 고르고 원래 쿼리와 해시를 확인합니다.', step3: '링크를 복사하거나 CSV를 다운로드하고 게시 전 랜딩 페이지를 확인합니다.',
  },
  de: {
    name: 'Kampagnen-UTM', description: 'Setzt UTM-Parameter stapelweise und behält Abfrage und Anker.', disclaimer: 'Keine Klicks, keine personenbezogenen Daten und keine doppelte Kodierung.',
    urls: 'Ziel-URLs (eine pro Zeile)', urlsHint: 'https://example.com/page', duplicatePolicy: 'Vorhandene UTM-Parameter', overwrite: 'Alte Werte überschreiben', keep: 'Alte Werte behalten', flag: 'Als Problem markieren', generatedLinks: 'Erzeugte Links',
    usageTitle: 'So geht es', step1: 'Fügen Sie pro Zeile eine Ziel-URL ein und füllen Sie source, medium und campaign aus.', step2: 'Wählen Sie den Umgang mit vorhandenen UTM-Werten und prüfen Sie Abfrage und Anker.', step3: 'Kopieren Sie Links oder laden Sie CSV herunter und prüfen Sie die Zielseite vor dem Start.',
  },
  fr: {
    name: 'Liens UTM de campagne', description: 'Ajoute les UTM en lot en conservant la requête et l’ancre.', disclaimer: 'Aucun clic ni donnée personnelle ; le texte est encodé une seule fois.',
    urls: 'URL de destination (une par ligne)', urlsHint: 'https://example.com/page', duplicatePolicy: 'Paramètres UTM existants', overwrite: 'Remplacer les anciennes valeurs', keep: 'Conserver les anciennes valeurs', flag: 'Signaler comme problème', generatedLinks: 'Liens générés',
    usageTitle: 'Mode d’emploi', step1: 'Collez une URL par ligne et saisissez source, medium, campaign et les champs facultatifs.', step2: 'Choisissez le traitement des UTM existants et vérifiez la requête et l’ancre.', step3: 'Copiez les liens ou téléchargez le CSV, puis vérifiez la page avant publication.',
  },
  es: {
    name: 'Enlaces UTM de campaña', description: 'Aplica UTM en lote conservando la consulta y el ancla.', disclaimer: 'No envía clics ni añade datos personales; el texto se codifica una vez.',
    urls: 'URL de destino (una por línea)', urlsHint: 'https://example.com/page', duplicatePolicy: 'Parámetros UTM existentes', overwrite: 'Sobrescribir valores anteriores', keep: 'Conservar valores anteriores', flag: 'Marcar como problema', generatedLinks: 'Enlaces generados',
    usageTitle: 'Cómo usarlo', step1: 'Pega una URL por línea e introduce source, medium, campaign y valores opcionales.', step2: 'Elige cómo tratar los UTM existentes y revisa la consulta y el ancla.', step3: 'Copia los enlaces o descarga CSV y comprueba la página antes de publicar.',
  },
  'pt-BR': {
    name: 'Links UTM de campanha', description: 'Aplica UTM em lote preservando a consulta e a âncora.', disclaimer: 'Não envia cliques nem adiciona dados pessoais; o texto é codificado uma vez.',
    urls: 'URLs de destino (uma por linha)', urlsHint: 'https://example.com/page', duplicatePolicy: 'Parâmetros UTM existentes', overwrite: 'Substituir valores antigos', keep: 'Manter valores antigos', flag: 'Marcar como problema', generatedLinks: 'Links gerados',
    usageTitle: 'Como usar', step1: 'Cole uma URL por linha e preencha source, medium, campaign e campos opcionais.', step2: 'Escolha como tratar UTM existentes e confira a consulta e a âncora.', step3: 'Copie os links ou baixe CSV e verifique a página antes de publicar.',
  },
}
