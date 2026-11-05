/** Render width in CSS px: never exceed the container, never below 1. */
export function fitWidth(propWidth: number, containerWidth: number): number {
  return Math.max(1, Math.min(Math.floor(propWidth), Math.floor(containerWidth)))
}
