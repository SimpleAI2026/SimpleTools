export default {
  zh: {
    name: 'System Prompt 检查器',
    description: '启发式检查系统提示：空章节、矛盾 MUST/NEVER、未填占位符、提到工具却缺输出格式、过长、重复指令、注入话术与语言冲突。不调用模型。',
    placeholder: '粘贴 system prompt…',
    findings: '检查结果',
    severity: '级别',
    tip: '建议',
    error: '错误',
    warn: '警告',
    info: '信息',
  },
  en: {
    name: 'System Prompt Linter',
    description: 'Heuristic checks for system prompts: empty sections, MUST/NEVER clashes, unfilled placeholders, tools without output format, length, duplicates, injection phrasing, and language conflicts. No LLM calls.',
    placeholder: 'Paste a system prompt…',
    findings: 'Findings',
    severity: 'Severity',
    tip: 'Tip',
    error: 'Error',
    warn: 'Warning',
    info: 'Info',
  },
}
