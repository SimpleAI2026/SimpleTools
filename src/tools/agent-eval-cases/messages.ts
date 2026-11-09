export default {
  "zh-CN": {
    "name": "Agent 规则评测",
    "description": "用字段、文本和有步数上限的正则检查已有输出。",
    "disclaimer": "不运行 Agent。超时是未完成，不算通过。",
    "usageTitle": "使用方法",
    "step1": "填入已有输出，以及字段相等、包含文本或正则规则，先在本页看 pass、fail、invalid 和 incomplete。",
    "step2": "复制 cases.jsonl，贴到 Agent 评测配置的用例区，或贴进对话里当作待测样本。不要把结果状态当成规则。",
    "step3": "用同一条坏 JSON 和会超时的正则再测一次，确认坏 JSON 仍是 invalid，超时仍是 incomplete，而不是 pass。"
  },
  "en": {
    "name": "Agent rule eval",
    "description": "Check saved output with fields, text, and a step-limited pattern.",
    "disclaimer": "No agent runs. A timeout is incomplete, not a pass.",
    "usageTitle": "How to use",
    "step1": "Enter the saved output plus field, text, or pattern rules, and read pass, fail, invalid, and incomplete on this page first.",
    "step2": "Copy cases.jsonl and paste it into the case area of an agent eval config, or into a chat as the sample under test. Do not treat the status column as a rule.",
    "step3": "Run the same broken JSON and the same too-slow pattern again, and confirm broken JSON stays invalid and a timeout stays incomplete, not pass."
  },
  "ja": {
    "name": "エージェント規則評価",
    "description": "保存済み出力を項目、文字列、ステップ上限つき正規表現で判定します。",
    "disclaimer": "エージェントは実行しません。時間切れは不合格ではなく未完了です。",
    "usageTitle": "使い方",
    "step1": "保存済み出力と、フィールド、文字列、正規表現の規則を入れ、この画面で pass、fail、invalid、incomplete を先に見ます。",
    "step2": "cases.jsonl をコピーし、エージェント評価設定のケース欄、または会話の試験サンプルとして貼ります。結果の状態を規則にしないでください。",
    "step3": "同じ壊れた JSON と遅すぎる正規表現をもう一度試し、壊れた JSON は invalid、時間切れは incomplete のままか確認します。"
  },
  "ko": {
    "name": "에이전트 규칙 평가",
    "description": "저장된 출력을 필드, 문자열, 단계 제한 정규식으로 판정합니다.",
    "disclaimer": "에이전트를 실행하지 않습니다. 시간 초과는 통과가 아니라 미완료입니다.",
    "usageTitle": "사용 방법",
    "step1": "저장된 출력과 필드, 문자열, 정규식 규칙을 넣고 이 화면에서 pass, fail, invalid, incomplete를 먼저 봅니다.",
    "step2": "cases.jsonl을 복사해 에이전트 평가 설정의 사례 칸이나 대화의 시험 샘플로 붙입니다. 결과 상태를 규칙으로 쓰지 않습니다.",
    "step3": "같은 깨진 JSON과 너무 느린 정규식을 다시 시험해, 깨진 JSON은 invalid, 시간 초과는 incomplete로 남는지 확인합니다."
  },
  "de": {
    "name": "Agent-Regelprufung",
    "description": "Pruft vorhandene Ausgaben mit Feldern, Text und einem begrenzten Muster.",
    "disclaimer": "Kein Agent lauft. Zeituberschreitung ist unvollstandig, kein Bestehen.",
    "usageTitle": "So geht es",
    "step1": "Vorhandene Ausgabe plus Feld-, Text- oder Musterregeln eintragen und hier zuerst pass, fail, invalid und incomplete lesen.",
    "step2": "cases.jsonl kopieren und in das Fallfeld einer Agent-Pruefung oder als Testprobe in den Chat kleben. Die Statusspalte ist keine Regel.",
    "step3": "Dasselbe defekte JSON und dasselbe zu langsame Muster noch einmal pruefen: defektes JSON bleibt invalid, Zeitueberschreitung bleibt incomplete."
  },
  "fr": {
    "name": "Evaluation par regles",
    "description": "Controle une sortie deja produite avec des champs, du texte et un motif borne.",
    "disclaimer": "Aucun agent n'est lance. Un depassement reste incomplet.",
    "usageTitle": "Mode d'emploi",
    "step1": "Saisissez la sortie deja produite et les regles de champ, de texte ou de motif, puis lisez ici pass, fail, invalid et incomplete.",
    "step2": "Copiez cases.jsonl et collez-le dans la zone de cas d'une config d'evaluation d'agent, ou dans le chat comme echantillon a tester. Le statut n'est pas une regle.",
    "step3": "Reessayez le meme JSON casse et le meme motif trop lent: le JSON casse reste invalid, et le depassement reste incomplete."
  },
  "es": {
    "name": "Evaluacion por reglas",
    "description": "Revisa una salida ya hecha con campos, texto y un patron con limite de pasos.",
    "disclaimer": "No ejecuta un agente. El exceso de pasos queda incompleto.",
    "usageTitle": "Como usarlo",
    "step1": "Escriba la salida ya hecha y las reglas de campo, texto o patron, y lea aqui pass, fail, invalid e incomplete.",
    "step2": "Copie cases.jsonl y peguelo en el area de casos de una evaluacion de agente, o en el chat como muestra a probar. El estado no es una regla.",
    "step3": "Repita el mismo JSON roto y el mismo patron demasiado lento: el JSON roto sigue en invalid y el exceso sigue en incomplete."
  },
  "pt-BR": {
    "name": "Avaliacao por regras",
    "description": "Confere uma saida pronta com campos, texto e um padrao com limite de passos.",
    "disclaimer": "Nenhum agente e executado. Estourar o limite fica incompleto.",
    "usageTitle": "Como usar",
    "step1": "Informe a saida pronta e as regras de campo, texto ou padrao, e leia aqui pass, fail, invalid e incomplete.",
    "step2": "Copie cases.jsonl e cole na area de casos de uma avaliacao de agente, ou no chat como amostra de teste. O status nao e uma regra.",
    "step3": "Repita o mesmo JSON quebrado e o mesmo padrao lento demais: o JSON quebrado continua invalid e o estouro continua incomplete."
  }
}
