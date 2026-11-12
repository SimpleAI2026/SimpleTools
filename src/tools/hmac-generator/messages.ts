import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'HMAC generator',
    description: 'Compute an HMAC with SHA-1, SHA-256, SHA-384, or SHA-512. Hex or Base64.',
    message: 'Message',
    key: 'Key',
    algo: 'Algorithm',
    encoding: 'Encoding',
    usageTitle: 'How to use',
    step1: 'Paste the message and the key. Both are treated as UTF-8 text.',
    step2: 'Pick the hash and hex or Base64.',
    step3: 'Copy the digest into a test fixture. Do not paste a production key into a shared chat.',
  },
  {
    'zh-CN': { name: 'HMAC 生成', description: '用 SHA-1、SHA-256、SHA-384 或 SHA-512 计算 HMAC。输出十六进制或 Base64。', message: '消息', key: '密钥', algo: '算法', encoding: '编码', usageTitle: '使用方法', step1: '粘贴消息和密钥。两者都按 UTF-8 文本处理。', step2: '选择哈希，以及十六进制或 Base64。', step3: '把摘要复制到测试夹具。不要把生产密钥贴进共享对话。' },
    ja: { name: 'HMAC 生成', description: 'SHA-1、SHA-256、SHA-384、SHA-512 で HMAC を計算します。16進または Base64 です。', message: 'メッセージ', key: '鍵', algo: 'アルゴリズム', encoding: '符号化', usageTitle: '使い方', step1: 'メッセージと鍵を貼ります。どちらも UTF-8 のテキストとして扱います。', step2: 'ハッシュと、16進か Base64 かを選びます。', step3: 'ダイジェストをテストデータにコピーします。本番の鍵は共有チャットに置かないでください。' },
    ko: { name: 'HMAC 생성', description: 'SHA-1, SHA-256, SHA-384, SHA-512로 HMAC을 계산합니다. 16진수 또는 Base64입니다.', message: '메시지', key: '키', algo: '알고리즘', encoding: '인코딩', usageTitle: '사용 방법', step1: '메시지와 키를 붙입니다. 둘 다 UTF-8 텍스트로 다룹니다.', step2: '해시와 16진수 또는 Base64를 고릅니다.', step3: '다이제스트를 테스트 픽스처에 복사합니다. 운영 키는 공유 대화에 붙이지 마세요.' },
    de: { name: 'HMAC-Generator', description: 'Berechnet ein HMAC mit SHA-1, SHA-256, SHA-384 oder SHA-512. Hex oder Base64.', message: 'Nachricht', key: 'Schlüssel', algo: 'Algorithmus', encoding: 'Kodierung', usageTitle: 'Verwendung', step1: 'Nachricht und Schlüssel einfügen. Beides gilt als UTF-8-Text.', step2: 'Hash sowie Hex oder Base64 wählen.', step3: 'Den Digest in ein Test-Fixture kopieren. Einen Produktionsschlüssel nicht in einen geteilten Chat legen.' },
    fr: { name: 'Générateur HMAC', description: 'Calcule un HMAC avec SHA-1, SHA-256, SHA-384 ou SHA-512. Hex ou Base64.', message: 'Message', key: 'Clé', algo: 'Algorithme', encoding: 'Encodage', usageTitle: 'Mode d’emploi', step1: 'Collez le message et la clé. Les deux sont traités comme du texte UTF-8.', step2: 'Choisissez le hachage, puis hex ou Base64.', step3: 'Copiez le condensé dans un jeu d’essai. Ne placez pas une clé de production dans un chat partagé.' },
    es: { name: 'Generador HMAC', description: 'Calcula un HMAC con SHA-1, SHA-256, SHA-384 o SHA-512. Hex o Base64.', message: 'Mensaje', key: 'Clave', algo: 'Algoritmo', encoding: 'Codificación', usageTitle: 'Cómo usarlo', step1: 'Pega el mensaje y la clave. Ambos se tratan como texto UTF-8.', step2: 'Elige el hash y hex o Base64.', step3: 'Copia el resumen a un fixture de prueba. No pongas una clave de producción en un chat compartido.' },
    'pt-BR': { name: 'Gerador HMAC', description: 'Calcula um HMAC com SHA-1, SHA-256, SHA-384 ou SHA-512. Hex ou Base64.', message: 'Mensagem', key: 'Chave', algo: 'Algoritmo', encoding: 'Codificação', usageTitle: 'Como usar', step1: 'Cole a mensagem e a chave. As duas são tratadas como texto UTF-8.', step2: 'Escolha o hash e hex ou Base64.', step3: 'Copie o resumo para um fixture de teste. Não coloque uma chave de produção num chat compartilhado.' },
  },
)
