export default {
  "zh-CN": {
    name: "System Prompt 检查器",
    description: "启发式检查系统提示：空章节、矛盾 MUST/NEVER、未填占位符、提到工具却缺输出格式、过长、重复指令、注入话术与语言冲突。不调用模型。",
    placeholder: "粘贴 system prompt…",
    findings: "检查结果",
    severity: "级别",
    tip: "建议",
    error: "错误",
    warn: "警告",
    info: "信息"
  ,
    usageTitle: "使用方法",
    step1: "把现有 system prompt 贴进输入，先看错误、警告和建议。",
    step2: "按建议改输入框里的原文，再复制改后的全文，贴回模型的系统提示位置，不要贴进用户消息。",
    step3: "再检查一次，确认空章节、互相矛盾的 MUST 和未填占位符已经不在结果里。"
  },
  en: {
    name: "System Prompt Linter",
    description: "Heuristic checks for system prompts: empty sections, MUST/NEVER clashes, unfilled placeholders, tools without output format, length, duplicates, injection phrasing, and language conflicts. No LLM calls.",
    placeholder: "Paste a system prompt…",
    findings: "Findings",
    severity: "Severity",
    tip: "Tip",
    error: "Error",
    warn: "Warning",
    info: "Info"
  ,
    usageTitle: "How to use",
    step1: "Paste the current system prompt into the input and read the errors, warnings, and tips first.",
    step2: "Edit the original text in the input from those tips, then copy the revised full text into the model's system-prompt slot. Do not paste it into the user message.",
    step3: "Run the check again and confirm empty sections, clashing MUST lines, and unfilled placeholders are gone from the findings."
  },
  ja: {
    name: "システムプロンプトリンター",
    description: "システム プロンプトのヒューリスティック チェック: 空のセクション、MUST/NEVER のクラッシュ、未入力のプレースホルダー、出力形式のないツール、長さ、重複、インジェクション フレーズ、および言語の競合。 LLM 呼び出しはありません。",
    placeholder: "システムプロンプトを貼り付けます…",
    findings: "調査結果",
    severity: "重大度",
    tip: "ヒント",
    error: "エラー",
    warn: "警告",
    info: "情報"
  ,
    usageTitle: "使い方",
    step1: "今の system prompt を入力へ貼り、エラー、警告、提案を先に見ます。",
    step2: "提案に沿って入力の原文を直し、直した全文をコピーしてモデルのシステムプロンプト欄へ戻します。ユーザーメッセージには貼りません。",
    step3: "もう一度検査し、空の節、矛盾する MUST、未記入のプレースホルダが結果から消えたことを確認します。"
  },
  ko: {
    name: "시스템 프롬프트 린터",
    description: "시스템 프롬프트에 대한 경험적 검사: 빈 섹션, 충돌해야 하거나 절대 충돌하지 않아야 함, 채워지지 않은 자리 표시자, 출력 형식이 없는 도구, 길이, 중복, 삽입 구문 및 언어 충돌. LLM 호출이 없습니다.",
    placeholder: "시스템 프롬프트 붙여넣기…",
    findings: "조사 결과",
    severity: "심각성",
    tip: "팁",
    error: "오류",
    warn: "경고",
    info: "정보"
  ,
    usageTitle: "사용 방법",
    step1: "현재 system prompt를 입력에 붙이고 오류, 경고, 제안을 먼저 봅니다.",
    step2: "제안에 따라 입력의 원문을 고친 뒤, 고친 전문을 복사해 모델의 시스템 프롬프트 자리에 되돌립니다. 사용자 메시지에는 붙이지 않습니다.",
    step3: "다시 검사해 빈 절, 서로 충돌하는 MUST, 채우지 않은 자리표시자가 결과에서 없어졌는지 확인합니다."
  },
  de: {
    name: "System-Prompt-Linter",
    description: "Heuristische Prüfungen für Systemeingabeaufforderungen: leere Abschnitte, MUSS/NIEMALS-Konflikte, nicht ausgefüllte Platzhalter, Tools ohne Ausgabeformat, Länge, Duplikate, Injektionsphrasierung und Sprachkonflikte. Keine LLM-Anrufe.",
    placeholder: "Fügen Sie eine Systemaufforderung ein ...",
    findings: "Erkenntnisse",
    severity: "Schwere",
    tip: "Tipp",
    error: "Fehler",
    warn: "Warnung",
    info: "Info"
  ,
    usageTitle: "So geht es",
    step1: "Den aktuellen Systemprompt in die Eingabe kleben und zuerst Fehler, Warnungen und Hinweise lesen.",
    step2: "Den Originaltext in der Eingabe nach den Hinweisen aendern, dann den ganzen neuen Text in das Systemprompt-Feld des Modells kopieren. Nicht in die Nutzernachricht.",
    step3: "Noch einmal pruefen und bestaetigen, dass leere Abschnitte, widerspruechliche MUST-Zeilen und offene Platzhalter aus den Befunden weg sind."
  },
  fr: {
    name: "Linter d’invite système",
    description: "Vérifications heuristiques des invites système : sections vides, conflits DOIT/JAMAIS, espaces réservés non remplis, outils sans format de sortie, longueur, doublons, formulation d'injection et conflits de langue. Aucun appel LLM.",
    placeholder: "Collez une invite système…",
    findings: "Résultats",
    severity: "Gravité",
    tip: "Conseil",
    error: "Erreur",
    warn: "Avertissement",
    info: "Informations"
  ,
    usageTitle: "Mode d'emploi",
    step1: "Collez le prompt systeme actuel dans l'entree et lisez d'abord les erreurs, les avertissements et les conseils.",
    step2: "Corrigez le texte original dans l'entree selon ces conseils, puis copiez le texte entier revise dans l'emplacement de prompt systeme du modele. Pas dans le message utilisateur.",
    step3: "Relancez le controle et verifiez que les sections vides, les MUST contradictoires et les espaces non remplis ont disparu des resultats."
  },
  es: {
    name: "Linter de aviso del sistema",
    description: "Comprobaciones heurísticas de mensajes del sistema: secciones vacías, DEBE/NUNCA colisiones, marcadores de posición vacíos, herramientas sin formato de salida, longitud, duplicados, frases inyectadas y conflictos de idioma. No hay llamadas de LLM.",
    placeholder: "Pegue un mensaje del sistema...",
    findings: "Recomendaciones",
    severity: "Gravedad",
    tip: "Consejo",
    error: "Error",
    warn: "Advertencia",
    info: "Información"
  ,
    usageTitle: "Como usarlo",
    step1: "Pegue el prompt de sistema actual en la entrada y lea primero errores, avisos y sugerencias.",
    step2: "Corrija el texto original en la entrada segun esas sugerencias, luego copie el texto completo revisado en el lugar de prompt de sistema del modelo. No en el mensaje del usuario.",
    step3: "Vuelva a comprobar y confirme que las secciones vacias, los MUST contradictorios y los huecos sin rellenar ya no estan en los resultados."
  },
  "pt-BR": {
    name: "Linter de prompt do sistema",
    description: "Verificações heurísticas para prompts do sistema: seções vazias, conflitos DEVE/NUNCA, espaços reservados não preenchidos, ferramentas sem formato de saída, comprimento, duplicatas, frases de injeção e conflitos de idioma. Nenhuma chamada de LLM.",
    placeholder: "Cole um prompt do sistema…",
    findings: "Descobertas",
    severity: "Gravidade",
    tip: "Dica",
    error: "Erro",
    warn: "Aviso",
    info: "Informações"
  ,
    usageTitle: "Como usar",
    step1: "Cole o prompt de sistema atual na entrada e leia primeiro erros, avisos e sugestoes.",
    step2: "Corrija o texto original na entrada segundo essas sugestoes, depois copie o texto inteiro revisado no lugar de prompt de sistema do modelo. Nao na mensagem do usuario.",
    step3: "Confira de novo e veja se secoes vazias, MUST contraditorios e espacos nao preenchidos sumiram dos resultados."
  }
}
