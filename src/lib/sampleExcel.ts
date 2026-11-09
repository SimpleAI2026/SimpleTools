import { buildWorkbook, XLSX_MIME } from './excel'

/** Build a small demo workbook for Excel / spreadsheet tools. */
export async function loadSampleExcel(): Promise<File> {
  const bytes = await buildWorkbook([
    {
      name: 'Demo',
      header: true,
      rows: [
        ['Name', 'Category', 'Offline', 'Notes'],
        ['SimpleTools', 'toolbox', true, 'Front-end only'],
        ['Token Counter', 'AI Agent', true, 'gpt-tokenizer'],
        ['Excel Viewer', 'Office', true, 'exceljs'],
        ['PDF Overlay', 'PDF', true, 'pdf-lib'],
      ],
    },
  ])
  return new File([bytes as BlobPart], 'simpletools-sample.xlsx', { type: XLSX_MIME })
}
