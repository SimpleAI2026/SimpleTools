export default {
  "zh-CN": {
    name: "JWT 解码",
    description: "解码 JWT 头部与载荷，显示签发/过期时间，并可用密钥校验 HS256/384/512 签名。",
    token: "粘贴 JWT",
    header: "头部",
    payload: "载荷",
    signature: "签名",
    expired: "已过期",
    valid: "未过期",
    noExp: "无 exp 声明",
    secret: "HMAC 密钥（可选，仅本地校验）",
    verify: "校验签名",
    ok: "签名有效",
    bad: "签名无效",
    unsupported: "仅支持 HS256/384/512 本地校验",
    errors: {
      parts: "JWT 应由 2–3 段组成",
      decode: "无法解码 JWT"
    },
    claims: {
      iat: "签发时间",
      nbf: "生效时间",
      exp: "过期时间"
    }
  },
  en: {
    name: "JWT Decoder",
    description: "Decode JWT header and payload, show issued/expiry times, and verify HS256/384/512 signatures with a secret.",
    token: "Paste a JWT",
    header: "Header",
    payload: "Payload",
    signature: "Signature",
    expired: "Expired",
    valid: "Not expired",
    noExp: "No exp claim",
    secret: "HMAC secret (optional, verified locally)",
    verify: "Verify",
    ok: "Signature valid",
    bad: "Signature invalid",
    unsupported: "Only HS256/384/512 can be verified locally",
    errors: {
      parts: "A JWT has 2–3 parts",
      decode: "Could not decode the JWT"
    },
    claims: {
      iat: "Issued at",
      nbf: "Not before",
      exp: "Expires"
    }
  },
  ja: {
    name: "JWT デコーダ",
    description: "JWT ヘッダーとペイロードをデコードし、発行/有効期限を表示し、シークレットを使用して HS256/384/512 署名を検証します。",
    token: "JWTを貼り付ける",
    header: "ヘッダ",
    payload: "ペイロード",
    signature: "サイン",
    expired: "期限切れ",
    valid: "有効期限が切れていない",
    noExp: "経験値請求なし",
    secret: "HMAC シークレット (オプション、ローカルで検証)",
    verify: "確認する",
    ok: "署名は有効です",
    bad: "署名が無効です",
    unsupported: "ローカルで検証できるのは HS256/384/512 のみです",
    errors: {
      parts: "JWT には 2 ～ 3 つの部分があります",
      decode: "JWTをデコードできませんでした"
    },
    claims: {
      iat: "発行日",
      nbf: "以前はなかった",
      exp: "有効期限が切れます"
    }
  },
  ko: {
    name: "JWT 디코더",
    description: "JWT 헤더와 페이로드를 디코딩하고, 발행/만료 시간을 표시하고, 비밀로 HS256/384/512 서명을 확인하세요.",
    token: "JWT 붙여넣기",
    header: "헤더",
    payload: "유효 탑재량",
    signature: "서명",
    expired: "만료됨",
    valid: "만료되지 않음",
    noExp: "특급 청구 없음",
    secret: "HMAC 비밀번호(선택사항, 로컬에서 확인됨)",
    verify: "확인하다",
    ok: "유효한 서명",
    bad: "서명이 유효하지 않음",
    unsupported: "HS256/384/512만 로컬에서 확인할 수 있습니다.",
    errors: {
      parts: "JWT에는 2~3개의 부분이 있습니다.",
      decode: "JWT를 디코딩할 수 없습니다."
    },
    claims: {
      iat: "발행일",
      nbf: "이전에는 없었습니다",
      exp: "만료"
    }
  },
  de: {
    name: "JWT-Decoder",
    description: "Dekodieren Sie den JWT-Header und die Nutzlast, zeigen Sie Ausstellungs-/Ablaufzeiten an und überprüfen Sie HS256/384/512-Signaturen mit einem Geheimnis.",
    token: "Fügen Sie ein JWT ein",
    header: "Kopfzeile",
    payload: "Nutzlast",
    signature: "Unterschrift",
    expired: "Abgelaufen",
    valid: "Nicht abgelaufen",
    noExp: "Kein Exp-Anspruch",
    secret: "HMAC-Geheimnis (optional, lokal überprüft)",
    verify: "Verifizieren",
    ok: "Unterschrift gültig",
    bad: "Unterschrift ungültig",
    unsupported: "Nur HS256/384/512 kann lokal überprüft werden",
    errors: {
      parts: "Ein JWT besteht aus 2–3 Teilen",
      decode: "Das JWT konnte nicht dekodiert werden"
    },
    claims: {
      iat: "Ausgestellt am",
      nbf: "Nicht vorher",
      exp: "Läuft ab"
    }
  },
  fr: {
    name: "Décodeur JWT",
    description: "Décodez l'en-tête et la charge utile JWT, affichez les heures d'émission/d'expiration et vérifiez les signatures HS256/384/512 avec un secret.",
    token: "Coller un JWT",
    header: "En-tête",
    payload: "Charge utile",
    signature: "Signature",
    expired: "Expiré",
    valid: "Non expiré",
    noExp: "Aucune réclamation d'expérience",
    secret: "Secret HMAC (facultatif, vérifié localement)",
    verify: "Vérifier",
    ok: "Signature valide",
    bad: "Signature invalide",
    unsupported: "Seul HS256/384/512 peut être vérifié localement",
    errors: {
      parts: "Un JWT comporte 2 à 3 parties",
      decode: "Impossible de décoder le JWT"
    },
    claims: {
      iat: "Publié à",
      nbf: "Pas avant",
      exp: "Expire"
    }
  },
  es: {
    name: "Decodificador JWT",
    description: "Decodifica el encabezado y la carga útil de JWT, muestra los tiempos de emisión/caducidad y verifica las firmas HS256/384/512 con un secreto.",
    token: "Pegar un JWT",
    header: "Encabezamiento",
    payload: "Carga útil",
    signature: "Firma",
    expired: "Venció",
    valid: "No caducado",
    noExp: "Sin reclamo de exp",
    secret: "Secreto HMAC (opcional, verificado localmente)",
    verify: "Verificar",
    ok: "Firma válida",
    bad: "Firma no válida",
    unsupported: "Sólo HS256/384/512 se puede verificar localmente",
    errors: {
      parts: "Un JWT tiene de 2 a 3 partes",
      decode: "No se pudo decodificar el JWT"
    },
    claims: {
      iat: "Emitido en",
      nbf: "No antes",
      exp: "Vence"
    }
  },
  "pt-BR": {
    name: "Decodificador JWT",
    description: "Decodifique o cabeçalho e a carga JWT, mostre os tempos de emissão/expiração e verifique as assinaturas HS256/384/512 com um segredo.",
    token: "Cole um JWT",
    header: "Cabeçalho",
    payload: "Carga útil",
    signature: "Assinatura",
    expired: "Expirado",
    valid: "Não expirou",
    noExp: "Nenhuma reivindicação de experiência",
    secret: "Segredo HMAC (opcional, verificado localmente)",
    verify: "Verificar",
    ok: "Assinatura válida",
    bad: "Assinatura inválida",
    unsupported: "Somente HS256/384/512 pode ser verificado localmente",
    errors: {
      parts: "Um JWT tem 2–3 partes",
      decode: "Não foi possível decodificar o JWT"
    },
    claims: {
      iat: "Emitido em",
      nbf: "Não antes",
      exp: "Expira"
    }
  }
}
