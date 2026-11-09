export default {
  "zh-CN": {
    name: "AES 加解密",
    description: "使用 AES-256-GCM 与 PBKDF2 口令派生在本地加密/解密文本。",
    password: "口令",
    encrypt: "加密",
    decrypt: "解密",
    run: "执行",
    errors: {
      "no-password": "请输入口令",
      "bad-format": "密文格式无效",
      "wrong-password": "口令错误或密文已损坏"
    },
    note: "格式：Base64(盐16字节 {'|'} IV 12字节 {'|'} 密文+认证标签)，PBKDF2-SHA256 250,000 次迭代。"
  },
  en: {
    name: "AES Encryption",
    description: "Encrypt/decrypt text locally with AES-256-GCM and a PBKDF2-derived key.",
    password: "Password",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    run: "Run",
    errors: {
      "no-password": "Enter a password",
      "bad-format": "Invalid ciphertext format",
      "wrong-password": "Wrong password or corrupted ciphertext"
    },
    note: "Format: Base64(salt 16 B {'|'} IV 12 B {'|'} ciphertext+tag), PBKDF2-SHA256 with 250,000 iterations."
  },
  ja: {
    name: "AES暗号化",
    description: "AES-256-GCM と PBKDF2 派生キーを使用してテキストをローカルで暗号化/復号化します。",
    password: "パスワード",
    encrypt: "暗号化する",
    decrypt: "復号化",
    run: "走る",
    errors: {
      "no-password": "パスワードを入力してください",
      "bad-format": "無効な暗号文形式です",
      "wrong-password": "間違ったパスワードまたは破損した暗号文"
    },
    note: "形式: Base64(salt 16 B {'|'} IV 12 B {'|'} 暗号文+タグ)、PBKDF2-SHA256、250,000 反復。"
  },
  ko: {
    name: "AES 암호화",
    description: "AES-256-GCM 및 PBKDF2 파생 키를 사용하여 로컬에서 텍스트를 암호화/복호화합니다.",
    password: "비밀번호",
    encrypt: "암호화",
    decrypt: "암호 해독",
    run: "달리다",
    errors: {
      "no-password": "비밀번호를 입력하세요",
      "bad-format": "잘못된 암호문 형식",
      "wrong-password": "잘못된 비밀번호 또는 손상된 암호문"
    },
    note: "형식: Base64(salt 16 B {'|'} IV 12 B {'|'} 암호문+태그), PBKDF2-SHA256, 250,000회 반복."
  },
  de: {
    name: "AES-Verschlüsselung",
    description: "Verschlüsseln/entschlüsseln Sie Text lokal mit AES-256-GCM und einem von PBKDF2 abgeleiteten Schlüssel.",
    password: "Passwort",
    encrypt: "Verschlüsseln",
    decrypt: "Entschlüsseln",
    run: "Laufen",
    errors: {
      "no-password": "Geben Sie ein Passwort ein",
      "bad-format": "Ungültiges Chiffretextformat",
      "wrong-password": "Falsches Passwort oder beschädigter Geheimtext"
    },
    note: "Format: Base64(Salz 16 B {'|'} IV 12 B {'|'} Chiffretext+Tag), PBKDF2-SHA256 mit 250.000 Iterationen."
  },
  fr: {
    name: "Cryptage AES",
    description: "Chiffrez/déchiffrez le texte localement avec AES-256-GCM et une clé dérivée de PBKDF2.",
    password: "Mot de passe",
    encrypt: "Chiffrer",
    decrypt: "Décrypter",
    run: "Courir",
    errors: {
      "no-password": "Entrez un mot de passe",
      "bad-format": "Format de texte chiffré invalide",
      "wrong-password": "Mot de passe erroné ou texte chiffré corrompu"
    },
    note: "Format : Base64 (sel 16 B {'|'} IV 12 B {'|'} texte chiffré+balise), PBKDF2-SHA256 avec 250 000 itérations."
  },
  es: {
    name: "Cifrado AES",
    description: "Cifre/descifre texto localmente con AES-256-GCM y una clave derivada de PBKDF2.",
    password: "Contraseña",
    encrypt: "cifrar",
    decrypt: "Descifrar",
    run: "Correr",
    errors: {
      "no-password": "Introduce una contraseña",
      "bad-format": "Formato de texto cifrado no válido",
      "wrong-password": "Contraseña incorrecta o texto cifrado dañado"
    },
    note: "Formato: Base64(salt 16 B {'|'} IV 12 B {'|'} texto cifrado+etiqueta), PBKDF2-SHA256 con 250.000 iteraciones."
  },
  "pt-BR": {
    name: "Criptografia AES",
    description: "Criptografe/descriptografe texto localmente com AES-256-GCM e uma chave derivada de PBKDF2.",
    password: "Senha",
    encrypt: "Criptografar",
    decrypt: "Descriptografar",
    run: "Correr",
    errors: {
      "no-password": "Digite uma senha",
      "bad-format": "Formato de texto cifrado inválido",
      "wrong-password": "Senha errada ou texto cifrado corrompido"
    },
    note: "Formato: Base64(salt 16 B {'|'} IV 12 B {'|'} texto cifrado+tag), PBKDF2-SHA256 com 250.000 iterações."
  }
}
