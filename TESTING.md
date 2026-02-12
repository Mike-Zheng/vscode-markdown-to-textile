# Testing Guide / 測試指南

[English](#english) | [繁體中文](#繁體中文)

---

## English

### Overview

This extension includes a comprehensive test suite using Mocha and VS Code Test Framework. All tests are automated and can be run via npm/pnpm scripts.

### Running Tests

#### Quick Start

```bash
# Run all tests (recommended)
pnpm test
```

This command will:
1. Compile test files (`compile-tests`)
2. Compile the extension (`compile`)
3. Run ESLint checks (`lint`)
4. Execute all unit tests in a VS Code test environment

#### Individual Commands

```bash
# Compile tests only
pnpm run compile-tests

# Compile extension only
pnpm run compile

# Run linter only
pnpm run lint

# Run tests (requires prior compilation)
pnpm test
```

### Test Structure

#### Test Suites

The test suite is organized into 9 main categories:

1. **Basic Text Formatting** (4 tests)
   - Bold text
   - Italic text
   - Bold and italic
   - Mixed formatting

2. **Headings** (4 tests)
   - H1, H2, H3 headings
   - Multiple headings

3. **Links and Images** (4 tests)
   - Simple links
   - Links with titles
   - Images with/without alt text

4. **Inline Code** (3 tests)
   - Simple inline code
   - Special characters (% escaping)
   - Multiple inline codes

5. **Code Blocks** (3 tests)
   - With language specification
   - Without language
   - Multiple code blocks

6. **Lists** (3 tests)
   - Unordered lists
   - Ordered lists
   - Mixed content in lists

7. **Tables** (3 tests)
   - Simple tables with headers
   - Tables with alignment
   - Tables with formatting

8. **Blockquotes** (3 tests)
   - Simple blockquotes
   - Multi-line blockquotes
   - Blockquotes with formatting

9. **Complex Content & Edge Cases** (6 tests)
   - Mixed content types
   - Chinese content
   - Empty lines handling
   - Empty strings
   - Whitespace only
   - Special characters

**Total: 33 tests**

### Test Files

- **`src/test/extension.test.ts`** - Main unit test file
  - Tests MarkdownParser and TextileGenerator
  - Verifies conversion accuracy
  - Checks edge cases

- **`test-conversion.md`** - Manual test examples
  - Comprehensive Markdown samples
  - Used for visual testing
  - Real-world examples

- **`test-inline-code.md`** - Inline code edge cases
  - Special character handling
  - Percent sign escaping
  - CSS styling verification

### Understanding Test Results

#### Success Output

```
✔ Validated version: 1.109.2
✔ Found existing install in .vscode-test/...

Markdown to Textile Converter Test Suite
  Basic Text Formatting
    ✔ Bold text
    ✔ Italic text
    ...

  33 passing (52ms)
```

#### Common Issues

**1. "Error mutex already exists"**
- **Cause**: Another VS Code instance is running
- **Solution**: Ignore if tests still complete, or close other VS Code windows

**2. Test compilation errors**
- **Cause**: TypeScript errors in test files
- **Solution**: Run `pnpm run compile-tests` to see errors

**3. "Cannot find module 'vscode'"**
- **Cause**: Missing dependencies
- **Solution**: Run `pnpm install`

### Writing New Tests

#### Basic Test Template

```typescript
test('Test description', () => {
  const result = convert('markdown input');
  assert.ok(result.includes('expected output'));
});
```

#### Best Practices

1. **Use `assert.ok()` with `.includes()`** for flexible matching
2. **Use `assert.strictEqual()`** only when exact match is required
3. **Test one feature per test** for clarity
4. **Include edge cases** like empty strings, special characters
5. **Add comments** for non-obvious expectations

### Continuous Integration

To integrate tests into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: pnpm install

- name: Run tests
  run: xvfb-run -a pnpm test  # Linux requires xvfb
```

### Test Coverage

Current coverage includes:
- ✅ All basic Markdown syntax
- ✅ Redmine-specific Textile features
- ✅ Special character escaping
- ✅ Table alignment
- ✅ Code block syntax highlighting
- ✅ Chinese/Unicode content

Not yet covered:
- ⚠️ Nested lists
- ⚠️ HTML in Markdown
- ⚠️ Footnotes
- ⚠️ Task lists

---

## 繁體中文

### 概述

此擴充功能包含完整的測試套件，使用 Mocha 和 VS Code Test Framework。所有測試都是自動化的，可以透過 npm/pnpm 腳本運行。

### 執行測試

#### 快速開始

```bash
# 執行所有測試（推薦）
pnpm test
```

此命令將會：
1. 編譯測試檔案（`compile-tests`）
2. 編譯擴充功能（`compile`）
3. 執行 ESLint 檢查（`lint`）
4. 在 VS Code 測試環境中執行所有單元測試

#### 個別命令

```bash
# 僅編譯測試
pnpm run compile-tests

# 僅編譯擴充功能
pnpm run compile

# 僅執行程式碼檢查
pnpm run lint

# 執行測試（需要先編譯）
pnpm test
```

### 測試結構

#### 測試套件

測試套件分為 9 個主要類別：

1. **基本文字格式**（4 個測試）
   - 粗體文字
   - 斜體文字
   - 粗體加斜體
   - 混合格式

2. **標題**（4 個測試）
   - H1、H2、H3 標題
   - 多個標題

3. **連結和圖片**（4 個測試）
   - 簡單連結
   - 帶標題的連結
   - 有/無替代文字的圖片

4. **內聯程式碼**（3 個測試）
   - 簡單內聯程式碼
   - 特殊字元（% 轉義）
   - 多個內聯程式碼

5. **程式碼區塊**（3 個測試）
   - 有語言規格
   - 無語言規格
   - 多個程式碼區塊

6. **清單**（3 個測試）
   - 無序清單
   - 有序清單
   - 清單中的混合內容

7. **表格**（3 個測試）
   - 帶標頭的簡單表格
   - 帶對齊的表格
   - 帶格式的表格

8. **引用區塊**（3 個測試）
   - 簡單引用
   - 多行引用
   - 帶格式的引用

9. **複雜內容和邊界案例**（6 個測試）
   - 混合內容類型
   - 中文內容
   - 空行處理
   - 空字串
   - 僅空白
   - 特殊字元

**總計：33 個測試**

### 測試檔案

- **`src/test/extension.test.ts`** - 主要單元測試檔案
  - 測試 MarkdownParser 和 TextileGenerator
  - 驗證轉換準確性
  - 檢查邊界案例

- **`test-conversion.md`** - 手動測試範例
  - 完整的 Markdown 樣本
  - 用於視覺測試
  - 實際案例

- **`test-inline-code.md`** - 內聯程式碼邊界案例
  - 特殊字元處理
  - 百分號轉義
  - CSS 樣式驗證

### 理解測試結果

#### 成功輸出

```
✔ Validated version: 1.109.2
✔ Found existing install in .vscode-test/...

Markdown to Textile Converter Test Suite
  Basic Text Formatting
    ✔ Bold text
    ✔ Italic text
    ...

  33 passing (52ms)
```

#### 常見問題

**1. "Error mutex already exists"**
- **原因**：另一個 VS Code 實例正在運行
- **解決方案**：如果測試仍然完成可以忽略，或關閉其他 VS Code 視窗

**2. 測試編譯錯誤**
- **原因**：測試檔案中有 TypeScript 錯誤
- **解決方案**：執行 `pnpm run compile-tests` 查看錯誤

**3. "Cannot find module 'vscode'"**
- **原因**：缺少相依套件
- **解決方案**：執行 `pnpm install`

### 編寫新測試

#### 基本測試模板

```typescript
test('測試描述', () => {
  const result = convert('markdown 輸入');
  assert.ok(result.includes('預期輸出'));
});
```

#### 最佳實踐

1. **使用 `assert.ok()` 配合 `.includes()`** 進行彈性匹配
2. **僅在需要精確匹配時使用 `assert.strictEqual()`**
3. **每個測試測試一個功能**以保持清晰
4. **包含邊界案例**如空字串、特殊字元
5. **為不明顯的預期添加註釋**

### 持續整合

將測試整合到 CI/CD 管道：

```yaml
# GitHub Actions 範例
- name: 安裝相依套件
  run: pnpm install

- name: 執行測試
  run: xvfb-run -a pnpm test  # Linux 需要 xvfb
```

### 測試覆蓋率

目前覆蓋範圍包含：
- ✅ 所有基本 Markdown 語法
- ✅ Redmine 特定的 Textile 功能
- ✅ 特殊字元轉義
- ✅ 表格對齊
- ✅ 程式碼區塊語法高亮
- ✅ 中文/Unicode 內容

尚未覆蓋：
- ⚠️ 巢狀清單
- ⚠️ Markdown 中的 HTML
- ⚠️ 註腳
- ⚠️ 任務清單
