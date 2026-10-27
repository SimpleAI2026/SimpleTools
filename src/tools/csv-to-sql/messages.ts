export default {
  zh: { name: 'CSV 转 SQL', description: '根据 CSV 推断列类型，生成 CREATE TABLE 与批量 INSERT 语句。', table: '表名', dialect: '方言', createTable: '生成建表语句', batch: '每条 INSERT 行数', emptyAsNull: '空值视为 NULL' },
  en: { name: 'CSV to SQL', description: 'Infer column types from CSV and generate CREATE TABLE plus batched INSERT statements.', table: 'Table name', dialect: 'Dialect', createTable: 'CREATE TABLE', batch: 'Rows per INSERT', emptyAsNull: 'Empty as NULL' },
}
