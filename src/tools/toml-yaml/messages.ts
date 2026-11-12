import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'TOML and YAML',
    description: 'Convert TOML to YAML and YAML to TOML on this device.',
    errors: { invalid: 'That text is not valid in this direction.', root: 'YAML to TOML needs a mapping at the root, not a list or a scalar.' },
    usageTitle: 'How to use',
    step1: 'Paste TOML and convert toward YAML, or switch the direction and paste YAML.',
    step2: 'Check the output. A YAML list cannot become TOML because TOML’s root is a table.',
    step3: 'Copy the result into a config. Nothing is sent off this device.',
  },
  {
    'zh-CN': { name: 'TOML 与 YAML', description: '在本机把 TOML 转成 YAML，或把 YAML 转成 TOML。', errors: { invalid: '这段文本不能按当前方向转换。', root: 'YAML 转 TOML 时，根必须是映射，不能是列表或标量。' }, usageTitle: '使用方法', step1: '粘贴 TOML 并转向 YAML，或切换方向后粘贴 YAML。', step2: '检查输出。YAML 列表不能变成 TOML，因为 TOML 的根是表。', step3: '把结果复制到配置。内容不会离开这台设备。' },
    ja: { name: 'TOML と YAML', description: 'この端末で TOML を YAML に、YAML を TOML に変換します。', errors: { invalid: 'この方向ではそのテキストを変換できません。', root: 'YAML から TOML にするには、ルートがマップである必要があります。リストやスカラーは不可です。' }, usageTitle: '使い方', step1: 'TOML を貼って YAML へ変換するか、方向を切り替えて YAML を貼ります。', step2: '出力を確認します。TOML のルートはテーブルなので、YAML のリストにはできません。', step3: '結果を設定にコピーします。この端末の外には送りません。' },
    ko: { name: 'TOML과 YAML', description: '이 기기에서 TOML을 YAML로, YAML을 TOML로 바꿉니다.', errors: { invalid: '이 방향으로는 그 텍스트를 변환할 수 없습니다.', root: 'YAML을 TOML로 바꾸려면 루트가 매핑이어야 합니다. 목록이나 스칼라는 안 됩니다.' }, usageTitle: '사용 방법', step1: 'TOML을 붙여 YAML로 바꾸거나, 방향을 바꾼 뒤 YAML을 붙입니다.', step2: '출력을 확인합니다. TOML의 루트는 테이블이라 YAML 목록은 될 수 없습니다.', step3: '결과를 설정에 복사합니다. 이 기기 밖으로 보내지 않습니다.' },
    de: { name: 'TOML und YAML', description: 'Wandelt TOML in YAML und YAML in TOML auf diesem Gerät um.', errors: { invalid: 'Dieser Text ist in dieser Richtung ungültig.', root: 'YAML nach TOML braucht eine Abbildung an der Wurzel, keine Liste und keinen Skalar.' }, usageTitle: 'Verwendung', step1: 'TOML einfügen und nach YAML wandeln, oder die Richtung wechseln und YAML einfügen.', step2: 'Die Ausgabe prüfen. Eine YAML-Liste kann kein TOML werden, weil die TOML-Wurzel eine Tabelle ist.', step3: 'Das Ergebnis in eine Konfiguration kopieren. Nichts verlässt dieses Gerät.' },
    fr: { name: 'TOML et YAML', description: 'Convertit TOML en YAML et YAML en TOML sur cet appareil.', errors: { invalid: 'Ce texte n’est pas valide dans ce sens.', root: 'YAML vers TOML exige une table à la racine, pas une liste ni un scalaire.' }, usageTitle: 'Mode d’emploi', step1: 'Collez du TOML vers YAML, ou inversez le sens et collez du YAML.', step2: 'Vérifiez la sortie. Une liste YAML ne peut pas devenir du TOML, dont la racine est une table.', step3: 'Copiez le résultat dans une config. Rien ne quitte cet appareil.' },
    es: { name: 'TOML y YAML', description: 'Convierte TOML a YAML y YAML a TOML en este dispositivo.', errors: { invalid: 'Ese texto no es válido en esta dirección.', root: 'De YAML a TOML la raíz debe ser un mapa, no una lista ni un escalar.' }, usageTitle: 'Cómo usarlo', step1: 'Pega TOML hacia YAML, o cambia el sentido y pega YAML.', step2: 'Revisa la salida. Una lista YAML no puede ser TOML, porque la raíz de TOML es una tabla.', step3: 'Copia el resultado a una config. Nada sale de este dispositivo.' },
    'pt-BR': { name: 'TOML e YAML', description: 'Converte TOML para YAML e YAML para TOML neste aparelho.', errors: { invalid: 'Esse texto não é válido nesta direção.', root: 'De YAML para TOML a raiz precisa ser um mapa, não uma lista nem um escalar.' }, usageTitle: 'Como usar', step1: 'Cole TOML na direção do YAML, ou inverta e cole YAML.', step2: 'Confira a saída. Uma lista YAML não vira TOML, porque a raiz do TOML é uma tabela.', step3: 'Copie o resultado para uma config. Nada sai deste aparelho.' },
  },
)
