export const GIT_GROUPS = ['start', 'branch', 'commit', 'remote', 'history', 'undo'] as const
export type GitGroup = (typeof GIT_GROUPS)[number]

export interface GitItem {
  id: string
  group: GitGroup
  command: string
}

export const GIT_ITEMS: GitItem[] = [
  { id: 'init', group: 'start', command: 'git init' },
  { id: 'clone', group: 'start', command: 'git clone <url>' },
  { id: 'status', group: 'start', command: 'git status' },
  { id: 'diff', group: 'start', command: 'git diff' },
  { id: 'branch', group: 'branch', command: 'git branch' },
  { id: 'switchNew', group: 'branch', command: 'git switch -c <branch>' },
  { id: 'switch', group: 'branch', command: 'git switch <branch>' },
  { id: 'merge', group: 'branch', command: 'git merge <branch>' },
  { id: 'add', group: 'commit', command: 'git add -p' },
  { id: 'commit', group: 'commit', command: 'git commit -m "<message>"' },
  { id: 'amend', group: 'commit', command: 'git commit --amend' },
  { id: 'remote', group: 'remote', command: 'git remote -v' },
  { id: 'fetch', group: 'remote', command: 'git fetch --all --prune' },
  { id: 'pull', group: 'remote', command: 'git pull --ff-only' },
  { id: 'push', group: 'remote', command: 'git push -u origin HEAD' },
  { id: 'log', group: 'history', command: 'git log --oneline --graph --decorate -20' },
  { id: 'show', group: 'history', command: 'git show HEAD' },
  { id: 'blame', group: 'history', command: 'git blame <file>' },
  { id: 'restore', group: 'undo', command: 'git restore <file>' },
  { id: 'unstage', group: 'undo', command: 'git restore --staged <file>' },
  { id: 'stash', group: 'undo', command: 'git stash push -m "<message>"' },
  { id: 'stashPop', group: 'undo', command: 'git stash pop' },
  { id: 'resetSoft', group: 'undo', command: 'git reset --soft HEAD~1' },
  { id: 'revert', group: 'undo', command: 'git revert HEAD' },
]

export function filterGitItems(query: string): GitItem[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return GIT_ITEMS
  return GIT_ITEMS.filter((item) => terms.every((term) => `${item.id} ${item.group} ${item.command}`.toLowerCase().includes(term)))
}
