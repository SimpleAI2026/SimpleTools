export default {
  "zh-CN": {
    "name": "评测集划分",
    "description": "按来源组做确定性划分，并标出完全重复。",
    "disclaimer": "不做向量去重。相近句子只留给人工。同一组不会跨区。"
  ,
    "usageTitle": "使用方法",
    "step1": "填入样本 ID、来源组和文本，用固定 seed 分出 train、dev 和 holdout。",
    "step2": "复制 holdout.jsonl，作为评测集贴进 Agent 评测配置，不要和 train 文件混在同一次运行里。",
    "step3": "用同一个 seed 再划分一次，确认同一来源组仍在同一分区，完全重复仍被标出。"
  },
  "en": {
    "name": "Eval split and leak check",
    "description": "Split by source group with a fixed seed and flag exact duplicates.",
    "disclaimer": "No embedding dedupe. Near sentences stay for a person. A group stays in one split."
  ,
    "usageTitle": "How to use",
    "step1": "Enter sample IDs, source groups, and text, and split train, dev, and holdout with a fixed seed.",
    "step2": "Copy holdout.jsonl and paste it into the agent eval config as the eval set. Do not mix it with the train file in the same run.",
    "step3": "Split again with the same seed and confirm each source group stays in one split and exact duplicates are still flagged."
  },
  "ja": {
    "name": "評価データ分割",
    "description": "出典グループ単位で決定的に分け、完全一致を印します。",
    "disclaimer": "埋め込みによる重複排除はしません。近い文は人に残します。"
  ,
    "usageTitle": "使い方",
    "step1": "サンプル ID、出典グループ、本文を入れ、固定 seed で train、dev、holdout に分けます。",
    "step2": "holdout.jsonl をコピーし、エージェント評価設定の評価セットとして貼ります。同じ実行で train と混ぜないでください。",
    "step3": "同じ seed でもう一度分け、同じ出典グループが同じ区画に残り、完全一致が印付きのままか確認します。"
  },
  "ko": {
    "name": "평가셋 분할",
    "description": "출처 그룹 단위로 결정적 분할을 하고 완전 중복을 표시합니다.",
    "disclaimer": "임베딩 중복 제거는 하지 않습니다. 비슷한 문장은 사람에게 남깁니다."
  ,
    "usageTitle": "사용 방법",
    "step1": "샘플 ID, 출처 그룹, 본문을 넣고 고정 seed로 train, dev, holdout을 나눕니다.",
    "step2": "holdout.jsonl을 복사해 에이전트 평가 설정의 평가 집합으로 붙입니다. 같은 실행에서 train과 섞지 않습니다.",
    "step3": "같은 seed로 다시 나누어 같은 출처 그룹이 한 구역에 남고 완전 중복이 그대로 표시되는지 확인합니다."
  },
  "de": {
    "name": "Eval-Aufteilung",
    "description": "Teilt nach Quellengruppe mit festem Seed und markiert exakte Dubletten.",
    "disclaimer": "Keine Embedding-Deduplikation. Ahnliche Satze bleiben fur einen Menschen."
  ,
    "usageTitle": "So geht es",
    "step1": "Sample-ID, Quellengruppe und Text eintragen und mit festem Seed in train, dev und holdout teilen.",
    "step2": "holdout.jsonl kopieren und als Pruefmenge in die Agent-Auswertung kleben. Nicht im selben Lauf mit der train-Datei mischen.",
    "step3": "Mit demselben Seed erneut teilen und pruefen, dass jede Quellengruppe in einer Partition bleibt und exakte Dubletten weiter markiert sind."
  },
  "fr": {
    "name": "Decoupage d'evaluation",
    "description": "Separe par groupe source avec une graine fixe et signale les doublons exacts.",
    "disclaimer": "Pas de deduplication vectorielle. Les phrases proches restent humaines."
  ,
    "usageTitle": "Mode d'emploi",
    "step1": "Saisissez l'identifiant, le groupe source et le texte, puis separez train, dev et holdout avec une graine fixe.",
    "step2": "Copiez holdout.jsonl et collez-le dans la config d'evaluation de l'agent comme jeu d'evaluation. Ne le melangez pas avec train dans la meme execution.",
    "step3": "Separez encore avec la meme graine et verifiez que chaque groupe source reste dans une seule part et que les doublons exacts restent signales."
  },
  "es": {
    "name": "Division de evaluacion",
    "description": "Separa por grupo de origen con una semilla fija y marca duplicados exactos.",
    "disclaimer": "Sin deduplicacion vectorial. Las frases cercanas quedan para una persona."
  ,
    "usageTitle": "Como usarlo",
    "step1": "Escriba el identificador, el grupo de origen y el texto, y separe train, dev y holdout con una semilla fija.",
    "step2": "Copie holdout.jsonl y peguelo en la configuracion de evaluacion del agente como conjunto de evaluacion. No lo mezcle con train en la misma ejecucion.",
    "step3": "Vuelva a separar con la misma semilla y compruebe que cada grupo de origen sigue en una sola parte y que los duplicados exactos siguen marcados."
  },
  "pt-BR": {
    "name": "Divisao de avaliacao",
    "description": "Separa por grupo de origem com semente fixa e marca duplicatas exatas.",
    "disclaimer": "Sem deduplicacao vetorial. Frases parecidas ficam para uma pessoa."
  ,
    "usageTitle": "Como usar",
    "step1": "Preencha o ID, o grupo de origem e o texto, e separe train, dev e holdout com uma semente fixa.",
    "step2": "Copie holdout.jsonl e cole na configuracao de avaliacao do agente como conjunto de avaliacao. Nao misture com train na mesma execucao.",
    "step3": "Separe de novo com a mesma semente e confira se cada grupo de origem continua em uma so parte e se as duplicatas exatas continuam marcadas."
  }
}
