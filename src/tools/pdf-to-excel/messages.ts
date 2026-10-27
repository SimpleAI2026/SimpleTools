export default {
  zh: { name: 'PDF 转 Excel', description: '按文字坐标聚类识别 PDF 中的表格行列，导出为 .xlsx（每页一个工作表或合并为一个）。', mode: '工作表', perPage: '每页一个', single: '合并为一个', numbers: '数字转为数值', run: '提取表格', download: '下载 .xlsx', note: '适用于文字型 PDF 的规则表格；合并单元格、无对齐的版式可能需手动调整。' },
  en: { name: 'PDF to Excel', description: 'Detect table rows and columns from PDF text positions and export .xlsx (one sheet per page or combined).', mode: 'Sheets', perPage: 'One per page', single: 'Combined', numbers: 'Convert numbers', run: 'Extract tables', download: 'Download .xlsx', note: 'Works best for regular tables in text PDFs; merged cells or unaligned layouts may need manual fixes.' },
}
