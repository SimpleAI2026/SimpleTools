export default {
  "zh-CN": {
    "name": "工作流静态预检",
    "description": "检查声明图里的环、不可达节点和没有上限的重试。",
    "disclaimer": "不执行条件表达式，也不证明运行时安全。"
  ,
    "usageTitle": "使用方法",
    "step1": "导入节点、边和重试上限，先看循环、不可达节点和未知终点。",
    "step2": "在输入里改掉这些问题后，复制修正过的图 JSON，贴到 Agent 平台的工作流配置，不要贴进聊天正文。",
    "step3": "再跑一次预检，确认无上限循环已经消失，并且条件表达式仍然没有被执行。"
  },
  "en": {
    "name": "Workflow preflight",
    "description": "Check the declared graph for cycles, unreachable nodes, and retries without a limit.",
    "disclaimer": "Conditions are not executed, and this is not a runtime safety proof."
  ,
    "usageTitle": "How to use",
    "step1": "Import nodes, edges, and retry limits, and read cycles, unreachable nodes, and unknown endpoints first.",
    "step2": "Fix those issues in the input, then copy the corrected graph JSON and paste it into the agent platform's workflow config, not into the chat body.",
    "step3": "Run the preflight again and confirm the unbounded cycle is gone, and that condition expressions are still not executed."
  },
  "ja": {
    "name": "ワークフロー事前検査",
    "description": "宣言された図の循環、到達不能、上限のない再試行を見ます。",
    "disclaimer": "条件式は実行せず、実行時の安全証明でもありません。"
  ,
    "usageTitle": "使い方",
    "step1": "ノード、辺、再試行上限を入れ、循環、到達不能、不明な終点を先に見ます。",
    "step2": "入力で直したあと、修正済みの図 JSON をコピーし、エージェント基盤のワークフロー設定へ貼ります。会話本文には貼りません。",
    "step3": "もう一度事前検査し、上限のない循環が消え、条件式は今も実行されていないことを確認します。"
  },
  "ko": {
    "name": "워크플로 사전 검사",
    "description": "선언된 그래프의 순환, 도달 불가, 한도 없는 재시도를 봅니다.",
    "disclaimer": "조건식을 실행하지 않으며 런타임 안전 증명이 아닙니다."
  ,
    "usageTitle": "사용 방법",
    "step1": "노드, 간선, 재시도 한도를 넣고 순환, 도달 불가, 알 수 없는 끝을 먼저 봅니다.",
    "step2": "입력에서 고친 뒤, 수정한 그래프 JSON을 복사해 에이전트 플랫폼의 워크플로 설정에 붙입니다. 대화 본문에는 붙이지 않습니다.",
    "step3": "사전 검사를 다시 실행해 한도 없는 순환이 사라졌고 조건식은 여전히 실행되지 않는지 확인합니다."
  },
  "de": {
    "name": "Workflow-Vorprufung",
    "description": "Pruft den erklarten Graph auf Kreise, unerreichbare Knoten und Wiederholungen ohne Grenze.",
    "disclaimer": "Bedingungen werden nicht ausgefuhrt."
  ,
    "usageTitle": "So geht es",
    "step1": "Knoten, Kanten und Wiederholungsgrenzen importieren und zuerst Kreise, unerreichbare Knoten und unbekannte Enden lesen.",
    "step2": "Die Eingabe korrigieren, dann das korrigierte Graph-JSON kopieren und in die Workflow-Konfiguration der Agent-Plattform kleben, nicht in den Chat-Text.",
    "step3": "Die Vorpruefung erneut ausfuehren und bestaetigen, dass der unbegrenzte Kreis weg ist und Bedingungen weiter nicht ausgefuehrt werden."
  },
  "fr": {
    "name": "Prevol du workflow",
    "description": "Controle le graphe declare: boucles, noeuds inatteignables et reprises sans limite.",
    "disclaimer": "Les conditions ne sont pas executees."
  ,
    "usageTitle": "Mode d'emploi",
    "step1": "Importez noeuds, liens et limites de reprise, puis lisez d'abord les boucles, les noeuds inatteignables et les fins inconnues.",
    "step2": "Corrigez l'entree, copiez le JSON du graphe corrige et collez-le dans la configuration de workflow de la plateforme d'agent, pas dans le texte du chat.",
    "step3": "Relancez le precontrole et verifiez que la boucle sans limite a disparu et que les expressions de condition ne sont toujours pas executees."
  },
  "es": {
    "name": "Preflight del flujo",
    "description": "Revisa el grafo declarado: ciclos, nodos inalcanzables y reintentos sin limite.",
    "disclaimer": "Las condiciones no se ejecutan."
  ,
    "usageTitle": "Como usarlo",
    "step1": "Importe nodos, aristas y limites de reintento, y lea primero ciclos, nodos inalcanzables y finales desconocidos.",
    "step2": "Corrija la entrada, copie el JSON del grafo corregido y peguelo en la configuracion de flujo de la plataforma de agente, no en el texto del chat.",
    "step3": "Vuelva a ejecutar el preflight y compruebe que el ciclo sin limite desaparecio y que las condiciones siguen sin ejecutarse."
  },
  "pt-BR": {
    "name": "Preflight do fluxo",
    "description": "Confere o grafo declarado: ciclos, nos inalcancaveis e tentativas sem limite.",
    "disclaimer": "As condicoes nao sao executadas."
  ,
    "usageTitle": "Como usar",
    "step1": "Importe nos, arestas e limites de tentativa, e leia primeiro ciclos, nos inalcancaveis e fins desconhecidos.",
    "step2": "Corrija a entrada, copie o JSON do grafo corrigido e cole na configuracao de fluxo da plataforma de agente, nao no texto do chat.",
    "step3": "Rode o preflight de novo e confira se o ciclo sem limite sumiu e se as condicoes continuam sem execucao."
  }
}
