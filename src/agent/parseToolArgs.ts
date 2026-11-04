/**
 * Resilient parsing of OpenAI-style tool `arguments` strings.
 * Models often emit invalid JSON when values contain quotes/newlines (e.g. CSS).
 */

function looksLikeCss(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (/^:host\b/i.test(t)) return true;
  if (/--sc-[\w-]+\s*:/.test(t)) return true;
  if (/\{[\s\S]*--sc-/.test(t)) return true;
  return false;
}

function stripFences(s: string): string {
  return s
    .replace(/^```(?:json|css|javascript)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/** Extract a (possibly broken) JSON string value for key "css". */
export function extractBrokenCssField(raw: string): string | null {
  const key = /"css"\s*:\s*/.exec(raw);
  if (!key) return null;
  let i = key.index + key[0].length;
  while (i < raw.length && /\s/.test(raw[i]!)) i++;
  if (i >= raw.length) return null;

  // Quoted string — tolerate raw newlines and unescaped quotes inside CSS.
  if (raw[i] === '"' || raw[i] === "'") {
    const quote = raw[i];
    i += 1;
    let out = '';
    while (i < raw.length) {
      const ch = raw[i];
      if (ch === '\\' && i + 1 < raw.length) {
        const n = raw[i + 1];
        out +=
          n === 'n'
            ? '\n'
            : n === 'r'
              ? '\r'
              : n === 't'
                ? '\t'
                : n === '"' || n === "'" || n === '\\'
                  ? n
                  : n;
        i += 2;
        continue;
      }
      if (ch === quote) {
        const rest = raw.slice(i + 1).trimStart();
        // End of value if followed by , } or EOS — else treat as literal quote in CSS.
        if (!rest || rest.startsWith(',') || rest.startsWith('}')) {
          return out;
        }
        out += ch;
        i += 1;
        continue;
      }
      out += ch;
      i += 1;
    }
    return out.trim() ? out : null;
  }

  // Unquoted value: take until ,"note" or trailing }
  const rest = raw.slice(i);
  const cut = rest.search(/\s*,\s*"note"\s*:|\s*\}\s*$/);
  const body = (cut >= 0 ? rest.slice(0, cut) : rest).trim().replace(/,$/, '');
  return body || null;
}

function extractNoteField(raw: string): string | undefined {
  const m = /"note"\s*:\s*"((?:\\.|[^"\\])*)"/.exec(raw);
  if (!m) return undefined;
  try {
    return JSON.parse(`"${m[1]}"`);
  } catch {
    return m[1];
  }
}

function tryParse(s: string): unknown | undefined {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

/**
 * Parse tool call arguments JSON with repairs.
 * Never throws — returns `{}` for empty input; throws Error only if completely unusable
 * when `strict` (ToolRegistry catches and surfaces Invalid JSON).
 */
export function parseToolArguments(argsJson: string): unknown {
  const original = (argsJson ?? '').trim();
  if (!original) return {};

  const candidates = [original, stripFences(original)];
  for (const c of candidates) {
    const parsed = tryParse(c);
    if (parsed !== undefined) return parsed;
  }

  // Whole payload is CSS (model skipped JSON wrapper)
  if (looksLikeCss(original) || looksLikeCss(stripFences(original))) {
    return { css: stripFences(original) };
  }

  // Single-quoted JSON-ish keys/strings
  const singleToDouble = tryParse(
    original.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3').replace(/:\s*'([^']*)'/g, ': "$1"'),
  );
  if (singleToDouble !== undefined) return singleToDouble;

  // Broken {"css": "...multiline / unescaped..."}
  const css = extractBrokenCssField(original);
  if (css != null && css.trim()) {
    const note = extractNoteField(original);
    return note ? { css, note } : { css };
  }

  // Extract first {...} blob
  const brace = original.indexOf('{');
  const last = original.lastIndexOf('}');
  if (brace >= 0 && last > brace) {
    const slice = original.slice(brace, last + 1);
    const parsed = tryParse(slice);
    if (parsed !== undefined) return parsed;
    const css2 = extractBrokenCssField(slice);
    if (css2 != null && css2.trim()) {
      const note = extractNoteField(slice);
      return note ? { css: css2, note } : { css: css2 };
    }
  }

  // Last resort: if it mentions design tokens, treat as CSS
  if (/:host|--sc-/.test(original)) {
    return { css: stripFences(original) };
  }

  throw new Error('Invalid JSON arguments');
}
