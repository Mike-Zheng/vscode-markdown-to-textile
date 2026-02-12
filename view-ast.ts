#!/usr/bin/env node
import { MarkdownParser } from './src/markdown-ast';
import { TextileGenerator } from './src/textile-generator';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('用法: npx ts-node view-ast.ts <markdown-file>');
  console.log('');
  console.log('範例:');
  console.log('  npx ts-node view-ast.ts test-tailwind.md');
  console.log('  npx ts-node view-ast.ts README.md');
  process.exit(1);
}

const inputFile = args[0];

if (!fs.existsSync(inputFile)) {
  console.error(`❌ 找不到檔案: ${inputFile}`);
  process.exit(1);
}

const markdown = fs.readFileSync(inputFile, 'utf-8');
const basename = path.basename(inputFile, path.extname(inputFile));

console.log('=== Markdown AST 分析 ===\n');
console.log(`檔案: ${inputFile}`);
console.log(`大小: ${markdown.split('\n').length} 行`);
console.log('');

// Parse
const startParse = Date.now();
const parser = new MarkdownParser();
const ast = parser.parse(markdown);
const parseTime = Date.now() - startParse;

// Generate
const startGen = Date.now();
const generator = new TextileGenerator();
const textile = generator.generate(ast);
const genTime = Date.now() - startGen;

// Count nodes
const nodeStats: Record<string, number> = {};

function countNodes(node: any) {
  nodeStats[node.type] = (nodeStats[node.type] || 0) + 1;
  if (node.children) {
    node.children.forEach(countNodes);
  }
}

countNodes(ast);

console.log('節點統計:');
Object.entries(nodeStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

console.log('');
console.log('效能統計:');
console.log(`  - 解析時間: ${parseTime}ms`);
console.log(`  - 生成時間: ${genTime}ms`);
console.log(`  - 總時間: ${parseTime + genTime}ms`);

console.log('');
console.log('結構檢查:');

// Check for issues
const issues: string[] = [];

// Check lists
const lists = nodeStats['list'] || 0;
const listItems = nodeStats['listItem'] || 0;
if (lists > 0 && listItems === 0) {
  issues.push('⚠️  發現列表但沒有列表項目');
} else {
  console.log(`  ✅ 找到 ${lists} 個列表，包含 ${listItems} 個項目`);
}

// Check code blocks
const codeBlocks = nodeStats['codeBlock'] || 0;
const inlineCode = nodeStats['code'] || 0;
console.log(`  ✅ 找到 ${codeBlocks} 個程式碼區塊`);
console.log(`  ✅ 找到 ${inlineCode} 個內聯程式碼`);

// Check headings
const headings = nodeStats['heading'] || 0;
console.log(`  ✅ 找到 ${headings} 個標題`);

// Check tables
const tables = nodeStats['table'] || 0;
if (tables > 0) {
  console.log(`  ✅ 找到 ${tables} 個表格`);
}

if (issues.length > 0) {
  console.log('');
  console.log('⚠️  發現問題:');
  issues.forEach(issue => console.log(issue));
}

// Save files
const astFile = `${basename}-ast.json`;
const textileFile = `${basename}-output.textile`;
const summaryFile = `${basename}-summary.txt`;

fs.writeFileSync(astFile, JSON.stringify(ast, null, 2), 'utf-8');
fs.writeFileSync(textileFile, textile, 'utf-8');

const summary = `
Markdown AST 分析報告
=====================

輸入檔案: ${inputFile}
分析時間: ${new Date().toISOString()}

## 檔案資訊
- 總行數: ${markdown.split('\n').length}
- 總字元數: ${markdown.length}
- 總位元組: ${Buffer.byteLength(markdown, 'utf-8')}

## 節點統計
${Object.entries(nodeStats).sort((a, b) => b[1] - a[1]).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## 效能統計
- 解析時間: ${parseTime}ms
- 生成時間: ${genTime}ms
- 總處理時間: ${parseTime + genTime}ms

## 輸出檔案
- AST 結構: ${astFile}
- Textile 輸出: ${textileFile}
- 本報告: ${summaryFile}

## 檢查結果
${issues.length === 0 ? '✅ 無警告或錯誤' : issues.join('\n')}
`;

fs.writeFileSync(summaryFile, summary, 'utf-8');

console.log('');
console.log('✅ 檔案已生成:');
console.log(`  - ${astFile} (AST 結構)`);
console.log(`  - ${textileFile} (Textile 輸出)`);
console.log(`  - ${summaryFile} (分析報告)`);
console.log('');
console.log('完成！');
