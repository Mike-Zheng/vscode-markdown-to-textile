# Markdown to Textile Converter

[English](#english) | [繁體中文](#繁體中文)

---

## English

### Overview

A Visual Studio Code extension that converts Markdown syntax to Textile markup format. This tool is particularly useful for users who need to migrate content from Markdown-based systems to platforms that use Textile markup, such as Redmine.

### Features

- **In-Place Conversion**: Select Markdown text in the editor and convert it directly to Textile format
- **Rich Syntax Support**: Supports common Markdown elements including:
  - Headings (h1-h6)
  - Bold and italic text
  - Links and images
  - Ordered and unordered lists
  - Code blocks and inline code
  - Blockquotes
  - Horizontal rules
  - Line breaks
- **AST-Based Parser**: Uses Abstract Syntax Tree for accurate conversion
- **Context Menu Integration**: Right-click on selected text to convert
- **User-Friendly**: Shows success/error notifications for all operations

### Installation

#### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/vscode-markdown-to-textile.git
   cd vscode-markdown-to-textile
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Compile the extension:
   ```bash
   pnpm run compile
   ```

4. Press F5 in VS Code to open a new Extension Development Host window

### Usage

1. Open a file with Markdown content in VS Code
2. Select the Markdown text you want to convert
3. Right-click and choose **"Convert Markdown to Textile"** from the context menu
   - Or open Command Palette (Ctrl+Shift+P / Cmd+Shift+P) and run **"Convert Markdown to Textile"**
4. The selected text will be replaced with Textile markup

### Syntax Conversion Examples

| Markdown | Textile |
|----------|---------|
| `# Heading 1` | `h1. Heading 1` |
| `## Heading 2` | `h2. Heading 2` |
| `**bold**` | `*bold*` |
| `*italic*` | `_italic_` |
| `[link](url)` | `"link":url` |
| `![alt](image.jpg)` | `!image.jpg(alt)!` |
| `` `code` `` | `@code@` |
| `- item` | `* item` |
| `1. item` | `# item` |
| `> quote` | `bq. quote` |

### Development Process

#### Project Architecture

The extension consists of three main modules:

1. **extension.ts** - Main entry point
   - Registers the conversion command
   - Handles editor interactions
   - Manages user feedback

2. **markdown-ast.ts** - Markdown Parser
   - Tokenizes Markdown input
   - Builds Abstract Syntax Tree (AST)
   - Handles nested structures

3. **textile-generator.ts** - Textile Generator
   - Traverses AST nodes
   - Generates Textile syntax
   - Formats output

#### Development Setup

1. **Prerequisites**
   ```bash
   Node.js >= 22.x
   pnpm >= 10.x
   Visual Studio Code >= 1.109.0
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Development Tasks**
   - Compile once: `pnpm run compile`
   - Watch mode: `pnpm run watch`
   - Run tests: `pnpm run test`
   - Lint code: `pnpm run lint`

4. **Build for Production**
   ```bash
   pnpm run package
   ```

#### Project Structure

```
vscode-markdown-to-textile/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── markdown-ast.ts        # Markdown parser
│   ├── textile-generator.ts   # Textile generator
│   └── test/
│       └── extension.test.ts  # Unit tests
├── dist/                      # Compiled output
├── .vscode/
│   └── tasks.json            # Build tasks
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── webpack.config.js         # Webpack config
```

#### Technical Stack

- **Language**: TypeScript 5.9+
- **Framework**: VS Code Extension API
- **Build Tool**: Webpack 5
- **Testing**: Mocha + VS Code Test Framework
- **Linting**: ESLint with TypeScript ESLint

#### Key Implementation Details

1. **Parser Design**: The Markdown parser uses a character-by-character scanning approach to tokenize input and construct an AST
2. **AST Structure**: Each node contains type information and optional attributes (level, url, language, etc.)
3. **Generator Pattern**: The Textile generator recursively traverses the AST and generates corresponding Textile syntax
4. **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages

### Requirements

- Visual Studio Code version 1.109.0 or higher
- No external dependencies required at runtime

### Known Issues

- Complex nested structures may require manual adjustment
- Some advanced Markdown features (tables, footnotes) are not yet supported
- HTML embedded in Markdown is not converted

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

[MIT License](LICENSE)

---

## 繁體中文

### 概述

這是一個 Visual Studio Code 擴充功能，能將 Markdown 語法轉換為 Textile 標記格式。此工具特別適合需要將內容從基於 Markdown 的系統遷移到使用 Textile 標記的平台（如 Redmine）的使用者。

### 功能特色

- **就地轉換**：在編輯器中選取 Markdown 文字並直接轉換為 Textile 格式
- **豐富的語法支援**：支援常見的 Markdown 元素，包括：
  - 標題（h1-h6）
  - 粗體和斜體文字
  - 連結和圖片
  - 有序和無序列表
  - 程式碼區塊和行內程式碼
  - 引用區塊
  - 水平分隔線
  - 換行符號
- **基於 AST 的解析器**：使用抽象語法樹確保精確轉換
- **右鍵選單整合**：右鍵點擊選取的文字即可轉換
- **使用者友善**：所有操作都會顯示成功/錯誤通知

### 安裝方式

#### 從原始碼安裝

1. 複製此儲存庫：
   ```bash
   git clone https://github.com/yourusername/vscode-markdown-to-textile.git
   cd vscode-markdown-to-textile
   ```

2. 安裝相依套件：
   ```bash
   pnpm install
   ```

3. 編譯擴充功能：
   ```bash
   pnpm run compile
   ```

4. 在 VS Code 中按 F5 開啟新的擴充功能開發視窗

### 使用方法

1. 在 VS Code 中開啟包含 Markdown 內容的檔案
2. 選取要轉換的 Markdown 文字
3. 右鍵點擊並從選單中選擇 **「Convert Markdown to Textile」**
   - 或開啟命令面板（Ctrl+Shift+P / Cmd+Shift+P）並執行 **「Convert Markdown to Textile」**
4. 選取的文字將被替換為 Textile 標記

### 語法轉換範例

| Markdown | Textile |
|----------|---------|
| `# 標題 1` | `h1. 標題 1` |
| `## 標題 2` | `h2. 標題 2` |
| `**粗體**` | `*粗體*` |
| `*斜體*` | `_斜體_` |
| `[連結](url)` | `"連結":url` |
| `![替代文字](image.jpg)` | `!image.jpg(替代文字)!` |
| `` `程式碼` `` | `@程式碼@` |
| `- 項目` | `* 項目` |
| `1. 項目` | `# 項目` |
| `> 引用` | `bq. 引用` |

### 開發流程

#### 專案架構

此擴充功能由三個主要模組組成：

1. **extension.ts** - 主要入口點
   - 註冊轉換命令
   - 處理編輯器互動
   - 管理使用者回饋

2. **markdown-ast.ts** - Markdown 解析器
   - 將 Markdown 輸入進行分詞
   - 建立抽象語法樹（AST）
   - 處理巢狀結構

3. **textile-generator.ts** - Textile 生成器
   - 遍歷 AST 節點
   - 生成 Textile 語法
   - 格式化輸出

#### 開發環境設定

1. **先決條件**
   ```bash
   Node.js >= 22.x
   pnpm >= 10.x
   Visual Studio Code >= 1.109.0
   ```

2. **安裝相依套件**
   ```bash
   pnpm install
   ```

3. **開發任務**
   - 單次編譯：`pnpm run compile`
   - 監視模式：`pnpm run watch`
   - 執行測試：`pnpm run test`
   - 程式碼檢查：`pnpm run lint`

4. **建置正式版本**
   ```bash
   pnpm run package
   ```

#### 專案結構

```
vscode-markdown-to-textile/
├── src/
│   ├── extension.ts           # 擴充功能入口點
│   ├── markdown-ast.ts        # Markdown 解析器
│   ├── textile-generator.ts   # Textile 生成器
│   └── test/
│       └── extension.test.ts  # 單元測試
├── dist/                      # 編譯輸出
├── .vscode/
│   └── tasks.json            # 建置任務
├── package.json              # 擴充功能清單
├── tsconfig.json             # TypeScript 設定
└── webpack.config.js         # Webpack 設定
```

#### 技術堆疊

- **程式語言**：TypeScript 5.9+
- **框架**：VS Code Extension API
- **建置工具**：Webpack 5
- **測試**：Mocha + VS Code Test Framework
- **程式碼檢查**：ESLint with TypeScript ESLint

#### 關鍵實作細節

1. **解析器設計**：Markdown 解析器採用逐字元掃描方式進行分詞並建構 AST
2. **AST 結構**：每個節點包含類型資訊和可選屬性（層級、網址、語言等）
3. **生成器模式**：Textile 生成器遞迴遍歷 AST 並生成對應的 Textile 語法
4. **錯誤處理**：完整的 try-catch 區塊配合使用者友善的錯誤訊息

### 系統需求

- Visual Studio Code 版本 1.109.0 或更高
- 執行時不需要外部相依套件

### 已知問題

- 複雜的巢狀結構可能需要手動調整
- 部分進階 Markdown 功能（表格、註腳）尚未支援
- Markdown 中嵌入的 HTML 不會被轉換

### 貢獻

歡迎貢獻！請隨時提交 Pull Request。

### 授權

[MIT License](LICENSE)

---

**Enjoy!**
