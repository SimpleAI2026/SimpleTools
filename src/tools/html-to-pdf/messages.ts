export default {
  zh: { name: 'HTML 转 PDF', description: '把 HTML（含 CSS）在浏览器中排版并分页导出为 PDF，可选纸张、方向、边距；脚本会被移除。', html: 'HTML', css: '额外 CSS（可选）', openHtml: '打开 .html 文件', page: '纸张', landscape: '横向', margin: '边距', run: '导出 PDF', note: '页面以高清图片形式写入 PDF（文字不可选中），可正确显示中文与 CSS 样式；跨域图片可能无法渲染。' },
  en: { name: 'HTML to PDF', description: 'Lay out HTML (with CSS) in the browser and export it as a paginated PDF; page size, orientation, margin. Scripts are removed.', html: 'HTML', css: 'Extra CSS (optional)', openHtml: 'Open .html file', page: 'Page size', landscape: 'Landscape', margin: 'Margin', run: 'Export PDF', note: 'Pages are written as high-res images (text not selectable) so CJK and CSS render faithfully; cross-origin images may not render.' },
}
