# Quick Reference - Testing / 測試快速參考

## 快速運行測試 / Quick Test Commands

```bash
# 完整測試（推薦）/ Full test suite (recommended)
pnpm test

# 僅編譯 / Compile only
pnpm run compile

# 僅測試編譯 / Compile tests only
pnpm run compile-tests

# 程式碼檢查 / Lint check
pnpm run lint

# 監視編譯 / Watch mode
pnpm run watch
```

## 測試結果 / Test Results

✅ **33 個測試全部通過 / 33 tests passing**

### 測試分類 / Test Categories

| 類別 Category | 測試數量 Tests | 狀態 Status |
|---------------|----------------|-------------|
| 基本格式 Basic Formatting | 4 | ✅ Pass |
| 標題 Headings | 4 | ✅ Pass |
| 連結/圖片 Links/Images | 4 | ✅ Pass |
| 內聯程式碼 Inline Code | 3 | ✅ Pass |
| 程式碼區塊 Code Blocks | 3 | ✅ Pass |
| 清單 Lists | 3 | ✅ Pass |
| 表格 Tables | 3 | ✅ Pass |
| 引用 Blockquotes | 3 | ✅ Pass |
| 複雜內容 Complex Content | 3 | ✅ Pass |
| 邊界案例 Edge Cases | 3 | ✅ Pass |
| **總計 Total** | **33** | **✅ All Pass** |

## 測試檔案 / Test Files

```
src/test/extension.test.ts  ← 單元測試 / Unit tests
test-conversion.md          ← 手動測試範例 / Manual test samples
test-inline-code.md         ← 特殊字元測試 / Special char tests
TESTING.md                  ← 完整測試文檔 / Full test guide
```

## 開發流程 / Development Workflow

```bash
# 1. 開始開發 / Start development
pnpm run watch

# 2. 按 F5 測試擴充功能 / Press F5 to test extension

# 3. 運行單元測試 / Run unit tests
pnpm test

# 4. 檢查程式碼 / Check code quality
pnpm run lint

# 5. 建置正式版 / Build for production
pnpm run package
```

## 常見問題 / Common Issues

**Q: "Error mutex already exists"**
A: 正常，測試仍會運行 / Normal, tests will still run

**Q: 如何只運行特定測試？ / How to run specific tests?**
A: 編輯 `extension.test.ts`，使用 `.only`：
```typescript
test.only('Test name', () => { ... });
```

**Q: 測試失敗怎麼辦？ / Test failed, what to do?**
A: 
1. 檢查錯誤訊息 / Check error message
2. 執行 `pnpm run compile-tests` / Run compile-tests
3. 查看 `TESTING.md` 完整指南 / See TESTING.md for full guide

## 下一步 / Next Steps

- ✅ 測試系統已完成 / Testing system complete
- ✅ 所有測試通過 / All tests passing
- ✅ ESLint 無警告 / No ESLint warnings
- ✅ 編譯成功 / Compilation successful

準備發佈！/ Ready for release!
