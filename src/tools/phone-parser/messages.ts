import { defineToolMessages } from '@/i18n/defineToolMessages'

export default defineToolMessages(
  {
    name: 'Phone parser',
    description: 'Parse a phone number with the bundled libphonenumber metadata. No lookup is sent.',
    usageTitle: 'How to use',
    step1: 'Paste a number with its country code, such as +44 20 7183 8750.',
    step2: 'Read E.164, the international form, the national form, and the country.',
    step3: 'Copy the E.164 line into a contact. The metadata is the smaller build, so some number types stay blank.',
  },
  {
    'zh-CN': { name: '电话号码解析', description: '用内置的 libphonenumber 元数据解析号码。不会发出查询。', usageTitle: '使用方法', step1: '粘贴带国家码的号码，例如 +44 20 7183 8750。', step2: '查看 E.164、国际格式、国内格式和国家。', step3: '把 E.164 那一行复制到联系人。元数据是较小的版本，有些号码类型会留空。' },
    ja: { name: '電話番号の解析', description: '同梱の libphonenumber メタデータで番号を解析します。照会は送りません。', usageTitle: '使い方', step1: '国番号付きの番号を貼ります。例 +44 20 7183 8750。', step2: 'E.164、国際形式、国内形式、国を読みます。', step3: 'E.164 の行を連絡先にコピーします。メタデータは小さい版なので、番号種別が空のことがあります。' },
    ko: { name: '전화번호 해석', description: '함께 담긴 libphonenumber 메타데이터로 번호를 해석합니다. 조회를 보내지 않습니다.', usageTitle: '사용 방법', step1: '국가 코드가 있는 번호를 붙입니다. 예: +44 20 7183 8750.', step2: 'E.164, 국제 형식, 국내 형식, 국가를 읽습니다.', step3: 'E.164 줄을 연락처에 복사합니다. 메타데이터는 작은 빌드라 일부 번호 유형은 비어 있습니다.' },
    de: { name: 'Telefonnummern', description: 'Liest eine Nummer mit den mitgelieferten libphonenumber-Metadaten. Es wird nichts nachgeschlagen.', usageTitle: 'Verwendung', step1: 'Eine Nummer mit Ländervorwahl einfügen, etwa +44 20 7183 8750.', step2: 'E.164, die internationale Form, die nationale Form und das Land lesen.', step3: 'Die E.164-Zeile in einen Kontakt kopieren. Die Metadaten sind die kleinere Fassung, deshalb bleibt mancher Typ leer.' },
    fr: { name: 'Numéros de téléphone', description: 'Analyse un numéro avec les métadonnées libphonenumber embarquées. Aucune requête n’est envoyée.', usageTitle: 'Mode d’emploi', step1: 'Collez un numéro avec l’indicatif, par exemple +44 20 7183 8750.', step2: 'Lisez le E.164, la forme internationale, la forme nationale et le pays.', step3: 'Copiez la ligne E.164 dans un contact. Les métadonnées sont la version réduite, donc certains types restent vides.' },
    es: { name: 'Teléfonos', description: 'Interpreta un número con los metadatos libphonenumber incluidos. No se envía ninguna consulta.', usageTitle: 'Cómo usarlo', step1: 'Pega un número con el prefijo del país, como +44 20 7183 8750.', step2: 'Lee E.164, la forma internacional, la nacional y el país.', step3: 'Copia la línea E.164 a un contacto. Los metadatos son la versión reducida, así que algunos tipos quedan vacíos.' },
    'pt-BR': { name: 'Telefones', description: 'Interpreta um número com os metadados libphonenumber embutidos. Nenhuma consulta é enviada.', usageTitle: 'Como usar', step1: 'Cole um número com o código do país, como +44 20 7183 8750.', step2: 'Leia E.164, a forma internacional, a nacional e o país.', step3: 'Copie a linha E.164 para um contato. Os metadados são a versão menor, então alguns tipos ficam em branco.' },
  },
)
