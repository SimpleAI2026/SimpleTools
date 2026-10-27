import { computed, ref, shallowRef } from 'vue'
import { readSpreadsheet, type SheetData } from './excel'

/** Load a spreadsheet file and track the active sheet. */
export function useSpreadsheet() {
  const sheets = shallowRef<SheetData[]>([])
  const active = ref(0)
  const fileName = ref('')
  const error = ref('')
  const busy = ref(false)
  async function load(f: File) {
    busy.value = true
    error.value = ''
    try {
      sheets.value = await readSpreadsheet(await f.arrayBuffer(), f.name)
      fileName.value = f.name
      active.value = 0
    } catch (e) {
      sheets.value = []
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      busy.value = false
    }
  }
  const sheet = computed(() => sheets.value[active.value])
  const baseName = computed(() => fileName.value.replace(/\.[^.]+$/, '') || 'workbook')
  return { sheets, active, sheet, fileName, baseName, error, busy, load }
}
