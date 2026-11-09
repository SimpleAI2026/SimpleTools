export default {
  "zh-CN": {
    "name": "AI 访问前提审计",
    "description": "解释导入的 robots 规则，并在没有响应头时记为未知。",
    "disclaimer": "不请求网址。schema 或 llms.txt 不代表会被收录。",
    "usageTitle": "使用方法",
    "step1": "导入已经取得的 robots 规则及响应头等证据；工具不会主动请求网址。",
    "step2": "分别查看抓取规则和 HTTP 证据，缺少响应头时保持未知。",
    "step3": "导出审计结果，并把这些前提证据与后续实际收录观测分开保存。"
  },
  "en": {
    "name": "AI access evidence",
    "description": "Explain imported robots rules and mark HTTP evidence unknown when headers are absent.",
    "disclaimer": "No URL is requested. A schema or llms.txt file is not inclusion proof.",
    "usageTitle": "How to use",
    "step1": "Import robots rules and any response headers you already collected; the tool does not request URLs.",
    "step2": "Review crawler rules and HTTP evidence separately, leaving missing header evidence unknown.",
    "step3": "Export the audit and keep these access prerequisites separate from later inclusion observations."
  },
  "ja": {
    "name": "AIアクセス前提",
    "description": "読み込んだ robots を説明し、ヘッダが無ければ HTTP は不明です。",
    "disclaimer": "URL へは行きません。schema や llms.txt は収録証明ではありません。",
    "usageTitle": "使い方",
    "step1": "サンプルを読み込むか、自分の入力を貼り付けて、結果を確認します。",
    "step2": "不足や不一致を入力で直し、もう一度実行して結果を更新します。",
    "step3": "最終結果をコピーまたはダウンロードし、作業記録と一緒に保存します。"
  },
  "ko": {
    "name": "AI 접근 전제 감사",
    "description": "가져온 robots 규칙을 설명하고 헤더가 없으면 HTTP는 알 수 없음입니다.",
    "disclaimer": "URL을 요청하지 않습니다. schema나 llms.txt는 수록 증거가 아닙니다.",
    "usageTitle": "사용 방법",
    "step1": "샘플을 불러오거나 직접 입력을 붙여 넣고 결과를 확인합니다.",
    "step2": "누락되거나 일치하지 않는 항목을 수정한 후 도구를 다시 실행하여 결과를 새로 고칩니다.",
    "step3": "최종 결과를 복사하거나 다운로드하여 작업 기록과 함께 저장합니다."
  },
  "de": {
    "name": "KI-Zugriffsprufung",
    "description": "Erklart importierte robots-Regeln und lasst HTTP unbekannt ohne Header.",
    "disclaimer": "Keine URL wird abgefragt. schema oder llms.txt ist kein Aufnahmebeleg.",
    "usageTitle": "So geht es",
    "step1": "Laden Sie das Beispiel oder fügen Sie eigene Eingaben ein, und prüfen Sie das Ergebnis.",
    "step2": "Korrigieren Sie fehlende oder widersprüchliche Einträge in der Eingabe und führen Sie das Tool erneut aus.",
    "step3": "Kopieren oder laden Sie das Endergebnis und speichern Sie es mit Ihren Projektaufzeichnungen."
  },
  "fr": {
    "name": "Audit d'acces IA",
    "description": "Explique les robots importes et laisse HTTP inconnu sans en-tetes.",
    "disclaimer": "Aucune URL n'est demandee. Un schema ou llms.txt n'est pas une preuve d'inclusion.",
    "usageTitle": "Mode d'emploi",
    "step1": "Chargez l'exemple ou collez votre propre entrée, puis examinez le résultat.",
    "step2": "Corrigez les éléments manquants ou incohérents dans l'entrée, puis relancez l'outil.",
    "step3": "Copiez ou téléchargez le résultat final et enregistrez-le avec les documents du projet."
  },
  "es": {
    "name": "Auditoria de acceso de IA",
    "description": "Explica las reglas robots importadas y deja HTTP desconocido sin cabeceras.",
    "disclaimer": "No pide la URL. Un schema o llms.txt no prueba inclusion.",
    "usageTitle": "Como usarlo",
    "step1": "Cargue el ejemplo o pegue su propia entrada y revise el resultado.",
    "step2": "Corrija los elementos que faltan o no coinciden en la entrada y ejecute la herramienta otra vez.",
    "step3": "Copie o descargue el resultado final y guárdelo con los registros del proyecto."
  },
  "pt-BR": {
    "name": "Auditoria de acesso de IA",
    "description": "Explica as regras robots importadas e deixa HTTP desconhecido sem cabecalhos.",
    "disclaimer": "Nao pede a URL. Um schema ou llms.txt nao prova inclusao.",
    "usageTitle": "Como usar",
    "step1": "Carregue o exemplo ou cole sua própria entrada e revise o resultado.",
    "step2": "Corrija os itens ausentes ou inconsistentes na entrada e execute a ferramenta novamente.",
    "step3": "Copie ou baixe o resultado final e salve-o com os registros do projeto."
  }
}
