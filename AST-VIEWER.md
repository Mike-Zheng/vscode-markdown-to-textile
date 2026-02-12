# AST Viewer for Markdown

這個工具可以幫你查看 Markdown 的 AST 結構和 Textile 轉換輸出。

## 使用方式

### 方法 1: 命令列

```bash
# 在專案根目錄執行
npx ts-node view-ast.ts <your-markdown-file.md>

# 例如
npx ts-node view-ast.ts test-tailwind.md
```

### 方法 2: VS Code 擴展

1. 按 F5 啟動擴展開發模式
2. 打開任何 Markdown 文件
3. 選取要轉換的文字
4. 右鍵 → "Convert Markdown to Textile"
5. 查看轉換結果

## 輸出文件

工具會生成三個文件：

1. **`{input}-ast.json`** - 完整的 AST 結構
2. **`{input}-output.textile`** - Textile 轉換結果
3. **`{input}-summary.txt`** - 統計摘要

## 統計資訊

查看器會顯示：
- 總節點數
- 各類型節點計數
- 列表數量（有序/無序）
- 程式碼區塊數量
- 內聯程式碼數量
- 錯誤和警告

## 範例輸出

```
=== Markdown AST 分析 ===

檔案: test-tailwind.md
大小: 140 行

節點統計:
- document: 1
- paragraph: 25
- heading: 8
- list: 10
- listItem: 45
- bold: 67
- code: 89
- codeBlock: 4
- text: 234

結構檢查:
✅ 無未閉合的格式化標記
✅ 所有列表項目正確封閉
✅ 程式碼區塊正確配對
✅ 無無限循環風險

轉換完成！
```

## 常見問題

### Q: AST 顯示亂碼？
A: 使用 UTF-8 編碼保存 Markdown 文件。

### Q: 列表解析錯誤？
A: 確保有序列表和無序列表之間有空行分隔。

### Q: 程式碼區塊沒有語言標記？
A: 檢查是否使用了正確的 ` ```language ` 格式。

## 調試技巧

1. **檢查 AST 結構**：打開 `*-ast.json` 查看完整的樹狀結構
2. **對比輸出**：將 `*-output.textile` 與預期結果比較
3. **查找問題節點**：在 AST 中搜索異常的 `type` 或 `children`
4. **驗證內聯程式碼**：確認 `%` 字元是否被轉義為 `&#37;`

## 已知限制

- 不支援嵌套列表（nested lists）的自動縮排
- HTML 標籤會被當作文字處理
- 複雜的表格對齊可能需要手動調整
- 程式碼區塊內的 Textile 標記不會被轉義
