import { isBookId } from "../../../src/tools/code-playground/docs/runtime";

/** Top-level docs/ folders that are not a language book. */
const NON_BOOK_DIRS = new Set(["en"]);

/**
 * Language books, the English edition, and private `_` folders.
 * Anything else under docs/ fails the docs schema. README images do not belong here.
 */
export function isKnownDocsDir(name: string): boolean {
  return name.startsWith("_") || NON_BOOK_DIRS.has(name) || isBookId(name);
}
