export type InstructionTarget = 'agents' | 'claude' | 'cursor' | 'windsurf'

export interface AgentInstructionsInput {
  projectName: string
  stack: string
  languages: string
  standards: string
  dos: string
  donts: string
  prCommands: string
  testCommands: string
}

export function defaultInstructionsInput(): AgentInstructionsInput {
  return {
    projectName: 'MyApp',
    stack: 'Vue 3 + TypeScript + Vite',
    languages: 'TypeScript, Vue',
    standards: '- Prefer small pure functions\n- Cover logic with vitest\n- Keep UI bilingual when user-facing',
    dos: '- Read existing patterns before editing\n- Run tests before claiming done',
    donts: '- Do not add backend dependencies without asking\n- Do not commit secrets',
    prCommands: 'yarn lint\nyarn test',
    testCommands: 'yarn test\nyarn build',
  }
}

function lines(block: string): string[] {
  return block
    .split(/\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
}

function bulletize(block: string): string {
  return lines(block)
    .map((l) => (l.startsWith('-') || l.startsWith('*') ? l : `- ${l}`))
    .join('\n')
}

export function generateAgentsMd(input: AgentInstructionsInput): string {
  return `# AGENTS.md — ${input.projectName}

## Project
- Name: ${input.projectName}
- Stack: ${input.stack}
- Languages: ${input.languages}

## Coding standards
${bulletize(input.standards)}

## Do
${bulletize(input.dos)}

## Don't
${bulletize(input.donts)}

## PR checklist commands
\`\`\`bash
${lines(input.prCommands).join('\n')}
\`\`\`

## Test / verify
\`\`\`bash
${lines(input.testCommands).join('\n')}
\`\`\`
`
}

export function generateClaudeMd(input: AgentInstructionsInput): string {
  return `# CLAUDE.md — ${input.projectName}

You are helping on **${input.projectName}** (${input.stack}).

## Languages
${input.languages}

## Standards
${bulletize(input.standards)}

## Prefer
${bulletize(input.dos)}

## Avoid
${bulletize(input.donts)}

## Commands
PR:
\`\`\`bash
${lines(input.prCommands).join('\n')}
\`\`\`

Test:
\`\`\`bash
${lines(input.testCommands).join('\n')}
\`\`\`
`
}

export function generateCursorRules(input: AgentInstructionsInput): string {
  return `---
description: Project coding agent rules for ${input.projectName}
globs:
alwaysApply: true
---

# ${input.projectName} rules

Stack: ${input.stack}
Languages: ${input.languages}

## Standards
${bulletize(input.standards)}

## Do
${bulletize(input.dos)}

## Don't
${bulletize(input.donts)}

## Verify
\`\`\`bash
${lines(input.testCommands).join('\n')}
\`\`\`
`
}

export function generateWindsurfRules(input: AgentInstructionsInput): string {
  return `# Windsurf rules — ${input.projectName}

## Context
- Project: ${input.projectName}
- Stack: ${input.stack}
- Languages: ${input.languages}

## Guidelines
${bulletize(input.standards)}

### Do
${bulletize(input.dos)}

### Don't
${bulletize(input.donts)}

## Commands
\`\`\`bash
${lines(input.prCommands).join('\n')}
${lines(input.testCommands).join('\n')}
\`\`\`
`
}

export function generateInstructions(input: AgentInstructionsInput, target: InstructionTarget): { filename: string; content: string } {
  switch (target) {
    case 'agents':
      return { filename: 'AGENTS.md', content: generateAgentsMd(input) }
    case 'claude':
      return { filename: 'CLAUDE.md', content: generateClaudeMd(input) }
    case 'cursor':
      return { filename: '.cursor/rules/project.mdc', content: generateCursorRules(input) }
    case 'windsurf':
      return { filename: '.windsurfrules', content: generateWindsurfRules(input) }
  }
}
