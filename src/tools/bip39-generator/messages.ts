import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'BIP-39 mnemonic',
    description: 'Generate and check an English BIP-39 phrase on this device.',
    strength: 'Entropy',
    generate: 'Generate',
    check: 'Check a phrase',
    valid: 'The checksum matches the English wordlist.',
    invalid: 'That phrase is not a valid English BIP-39 mnemonic.',
    usageTitle: 'How to use',
    step1: 'Choose the entropy and generate a phrase. The words stay in this tab.',
    step2: 'Copy it into a wallet only after you have written it down offline.',
    step3: 'Paste a phrase here to check the checksum. Do not put a real phrase in a shared chat.',
  },
  {
    'zh-CN': { name: 'BIP-39 助记词', description: '在本机生成并校验英文 BIP-39 助记词。', strength: '熵', generate: '生成', check: '校验助记词', valid: '校验和与英文词表一致。', invalid: '这不是有效的英文 BIP-39 助记词。', usageTitle: '使用方法', step1: '选择熵并生成助记词。单词留在这个标签页。', step2: '先在离线处抄下，再复制进钱包。', step3: '把助记词贴到这里检查校验和。不要把真实助记词发到共享对话。' },
    ja: { name: 'BIP-39 ニーモニック', description: '英語の BIP-39 フレーズをこの端末で作り、照合します。', strength: 'エントロピー', generate: '生成', check: 'フレーズを照合', valid: 'チェックサムは英語の単語リストと一致します。', invalid: '有効な英語の BIP-39 ニーモニックではありません。', usageTitle: '使い方', step1: 'エントロピーを選んでフレーズを作ります。単語はこのタブに残ります。', step2: 'オフラインに書き留めてからウォレットへコピーします。', step3: 'ここに貼ってチェックサムを確認します。本物のフレーズは共有チャットに置かないでください。' },
    ko: { name: 'BIP-39 니모닉', description: '영어 BIP-39 구문을 이 기기에서 만들고 확인합니다.', strength: '엔트로피', generate: '생성', check: '구문 확인', valid: '체크섬이 영어 단어 목록과 맞습니다.', invalid: '유효한 영어 BIP-39 니모닉이 아닙니다.', usageTitle: '사용 방법', step1: '엔트로피를 고르고 구문을 만듭니다. 단어는 이 탭에 남습니다.', step2: '오프라인에 적은 뒤에 지갑으로 복사합니다.', step3: '여기에 붙여 체크섬을 확인합니다. 실제 구문은 공유 대화에 올리지 마세요.' },
    de: { name: 'BIP-39-Mnemonic', description: 'Erzeugt und prüft eine englische BIP-39-Phrase auf diesem Gerät.', strength: 'Entropie', generate: 'Erzeugen', check: 'Phrase prüfen', valid: 'Die Prüfsumme passt zur englischen Wortliste.', invalid: 'Das ist keine gültige englische BIP-39-Phrase.', usageTitle: 'Verwendung', step1: 'Entropie wählen und eine Phrase erzeugen. Die Wörter bleiben in diesem Tab.', step2: 'Erst offline notieren, dann in eine Wallet kopieren.', step3: 'Eine Phrase hier einfügen, um die Prüfsumme zu prüfen. Eine echte Phrase nicht in einen geteilten Chat legen.' },
    fr: { name: 'Mnémonique BIP-39', description: 'Génère et vérifie une phrase BIP-39 anglaise sur cet appareil.', strength: 'Entropie', generate: 'Générer', check: 'Vérifier une phrase', valid: 'La somme de contrôle correspond à la liste anglaise.', invalid: 'Ce n’est pas une phrase BIP-39 anglaise valide.', usageTitle: 'Mode d’emploi', step1: 'Choisissez l’entropie et générez une phrase. Les mots restent dans cet onglet.', step2: 'Notez-la hors ligne avant de la copier dans un portefeuille.', step3: 'Collez une phrase ici pour vérifier la somme. Ne mettez pas une vraie phrase dans un chat partagé.' },
    es: { name: 'Mnemónico BIP-39', description: 'Genera y comprueba una frase BIP-39 en inglés en este dispositivo.', strength: 'Entropía', generate: 'Generar', check: 'Comprobar una frase', valid: 'La suma coincide con la lista en inglés.', invalid: 'Eso no es una frase BIP-39 en inglés válida.', usageTitle: 'Cómo usarlo', step1: 'Elige la entropía y genera una frase. Las palabras se quedan en esta pestaña.', step2: 'Anótala fuera de línea antes de copiarla a una cartera.', step3: 'Pega una frase aquí para comprobar la suma. No pongas una frase real en un chat compartido.' },
    'pt-BR': { name: 'Mnemônico BIP-39', description: 'Gera e confere uma frase BIP-39 em inglês neste aparelho.', strength: 'Entropia', generate: 'Gerar', check: 'Conferir uma frase', valid: 'A soma confere com a lista em inglês.', invalid: 'Isso não é uma frase BIP-39 em inglês válida.', usageTitle: 'Como usar', step1: 'Escolha a entropia e gere uma frase. As palavras ficam nesta aba.', step2: 'Anote fora da rede antes de copiar para uma carteira.', step3: 'Cole uma frase aqui para conferir a soma. Não coloque uma frase real num chat compartilhado.' },
  },
)
