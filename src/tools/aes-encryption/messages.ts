export default {
  zh: { name: 'AES 加解密', description: '使用 AES-256-GCM 与 PBKDF2 口令派生在本地加密/解密文本。', password: '口令', encrypt: '加密', decrypt: '解密', run: '执行', errors: { 'no-password': '请输入口令', 'bad-format': '密文格式无效', 'wrong-password': '口令错误或密文已损坏' }, note: '格式：Base64(盐16字节 {\'|\'} IV 12字节 {\'|\'} 密文+认证标签)，PBKDF2-SHA256 250,000 次迭代。' },
  en: { name: 'AES Encryption', description: 'Encrypt/decrypt text locally with AES-256-GCM and a PBKDF2-derived key.', password: 'Password', encrypt: 'Encrypt', decrypt: 'Decrypt', run: 'Run', errors: { 'no-password': 'Enter a password', 'bad-format': 'Invalid ciphertext format', 'wrong-password': 'Wrong password or corrupted ciphertext' }, note: 'Format: Base64(salt 16 B {\'|\'} IV 12 B {\'|\'} ciphertext+tag), PBKDF2-SHA256 with 250,000 iterations.' },
}
