export default {
  "zh-CN": {
    "name": "评测集划分",
    "description": "按来源组做确定性划分，并标出完全重复。",
    "disclaimer": "不做向量去重。相近句子只留给人工。同一组不会跨区。"
  },
  "en": {
    "name": "Eval split and leak check",
    "description": "Split by source group with a fixed seed and flag exact duplicates.",
    "disclaimer": "No embedding dedupe. Near sentences stay for a person. A group stays in one split."
  },
  "ja": {
    "name": "評価データ分割",
    "description": "出典グループ単位で決定的に分け、完全一致を印します。",
    "disclaimer": "埋め込みによる重複排除はしません。近い文は人に残します。"
  },
  "ko": {
    "name": "평가셋 분할",
    "description": "출처 그룹 단위로 결정적 분할을 하고 완전 중복을 표시합니다.",
    "disclaimer": "임베딩 중복 제거는 하지 않습니다. 비슷한 문장은 사람에게 남깁니다."
  },
  "de": {
    "name": "Eval-Aufteilung",
    "description": "Teilt nach Quellengruppe mit festem Seed und markiert exakte Dubletten.",
    "disclaimer": "Keine Embedding-Deduplikation. Ahnliche Satze bleiben fur einen Menschen."
  },
  "fr": {
    "name": "Decoupage d'evaluation",
    "description": "Separe par groupe source avec une graine fixe et signale les doublons exacts.",
    "disclaimer": "Pas de deduplication vectorielle. Les phrases proches restent humaines."
  },
  "es": {
    "name": "Division de evaluacion",
    "description": "Separa por grupo de origen con una semilla fija y marca duplicados exactos.",
    "disclaimer": "Sin deduplicacion vectorial. Las frases cercanas quedan para una persona."
  },
  "pt-BR": {
    "name": "Divisao de avaliacao",
    "description": "Separa por grupo de origem com semente fixa e marca duplicatas exatas.",
    "disclaimer": "Sem deduplicacao vetorial. Frases parecidas ficam para uma pessoa."
  }
}
