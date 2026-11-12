import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'PDF signature info',
    description: 'Read PKCS#7 signature dictionaries inside a PDF. The file stays on this device.',
    drop: 'Drop a PDF',
    none: 'No readable PKCS#7 signature was found.',
    note: 'This lists the embedded signer, digest algorithm, and signing time when the signature dictionary parses. It does not fetch a trust store or confirm that the byte range is intact.',
    usageTitle: 'How to use',
    step1: 'Drop a PDF. It is read in this tab.',
    step2: 'Read each signature that parses as PKCS#7 SignedData.',
    step3: 'Copy the lines into a note. A missing signature means the dictionary was absent or not PKCS#7.',
  },
  {
    'zh-CN': { name: 'PDF 签名信息', description: '读取 PDF 里的 PKCS#7 签名字典。文件留在本机。', drop: '拖入 PDF', none: '没有读到可解析的 PKCS#7 签名。', note: '签名字典能解析时，列出内嵌的签名者、摘要算法和签名时间。它不获取信任库，也不确认字节范围完好。', usageTitle: '使用方法', step1: '拖入 PDF。它在这个标签页里读取。', step2: '查看每一条能解析成 PKCS#7 SignedData 的签名。', step3: '把这几行复制到笔记。没有签名表示字典不存在，或不是 PKCS#7。' },
    ja: { name: 'PDF 署名情報', description: 'PDF 内の PKCS#7 署名辞書を読みます。ファイルはこの端末に残ります。', drop: 'PDF をドロップ', none: '読める PKCS#7 署名はありません。', note: '署名辞書が解析できたとき、埋め込まれた署名者、ダイジェスト、署名時刻を出します。信頼ストアは取得せず、バイト範囲の完全性も確認しません。', usageTitle: '使い方', step1: 'PDF をドロップします。このタブで読みます。', step2: 'PKCS#7 SignedData として解析できた署名を読みます。', step3: '行をメモにコピーします。署名が無いのは、辞書が無いか PKCS#7 ではないということです。' },
    ko: { name: 'PDF 서명 정보', description: 'PDF 안의 PKCS#7 서명 사전을 읽습니다. 파일은 이 기기에 남습니다.', drop: 'PDF 놓기', none: '읽을 수 있는 PKCS#7 서명이 없습니다.', note: '서명 사전을 해석하면 포함된 서명자, 다이제스트 알고리즘, 서명 시각을 보여 줍니다. 신뢰 저장소를 가져오지 않고 바이트 범위가 온전한지도 확인하지 않습니다.', usageTitle: '사용 방법', step1: 'PDF를 놓습니다. 이 탭에서 읽습니다.', step2: 'PKCS#7 SignedData로 해석된 서명을 읽습니다.', step3: '줄을 메모에 복사합니다. 서명이 없으면 사전이 없거나 PKCS#7이 아닙니다.' },
    de: { name: 'PDF-Signatur', description: 'Liest PKCS#7-Signaturwörterbücher in einem PDF. Die Datei bleibt auf diesem Gerät.', drop: 'PDF ablegen', none: 'Keine lesbare PKCS#7-Signatur gefunden.', note: 'Wenn das Wörterbuch lesbar ist, stehen Signierender, Digest-Algorithmus und Zeitpunkt hier. Es wird kein Vertrauensspeicher geladen und der Byte-Bereich nicht bestätigt.', usageTitle: 'Verwendung', step1: 'Ein PDF ablegen. Es wird in diesem Tab gelesen.', step2: 'Jede Signatur lesen, die als PKCS#7 SignedData lesbar ist.', step3: 'Die Zeilen in eine Notiz kopieren. Keine Signatur heißt: kein Wörterbuch oder kein PKCS#7.' },
    fr: { name: 'Signature PDF', description: 'Lit les dictionnaires de signature PKCS#7 d’un PDF. Le fichier reste sur cet appareil.', drop: 'Déposez un PDF', none: 'Aucune signature PKCS#7 lisible.', note: 'Quand le dictionnaire se lit, le signataire, l’algorithme d’empreinte et l’heure apparaissent. Aucun magasin de confiance n’est chargé et la plage d’octets n’est pas confirmée.', usageTitle: 'Mode d’emploi', step1: 'Déposez un PDF. Il est lu dans cet onglet.', step2: 'Lisez chaque signature qui se parse en PKCS#7 SignedData.', step3: 'Copiez les lignes dans une note. Aucune signature signifie un dictionnaire absent ou autre que PKCS#7.' },
    es: { name: 'Firma PDF', description: 'Lee los diccionarios de firma PKCS#7 de un PDF. El archivo se queda en este dispositivo.', drop: 'Suelta un PDF', none: 'No hay una firma PKCS#7 legible.', note: 'Si el diccionario se lee, aparecen el firmante, el algoritmo de resumen y la hora. No se descarga un almacén de confianza ni se confirma el rango de bytes.', usageTitle: 'Cómo usarlo', step1: 'Suelta un PDF. Se lee en esta pestaña.', step2: 'Lee cada firma que se interpreta como PKCS#7 SignedData.', step3: 'Copia las líneas a una nota. Sin firma significa que no había diccionario o que no era PKCS#7.' },
    'pt-BR': { name: 'Assinatura de PDF', description: 'Lê dicionários de assinatura PKCS#7 dentro de um PDF. O arquivo fica neste aparelho.', drop: 'Solte um PDF', none: 'Nenhuma assinatura PKCS#7 legível.', note: 'Quando o dicionário é lido, aparecem o signatário, o algoritmo de resumo e a hora. Nenhum repositório de confiança é baixado e o intervalo de bytes não é confirmado.', usageTitle: 'Como usar', step1: 'Solte um PDF. Ele é lido nesta aba.', step2: 'Leia cada assinatura que vira PKCS#7 SignedData.', step3: 'Copie as linhas para uma nota. Nenhuma assinatura significa dicionário ausente ou que não era PKCS#7.' },
  },
)
