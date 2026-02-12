"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_ast_1 = require("./src/markdown-ast");
const textile_generator_1 = require("./src/textile-generator");
function convert(markdown) {
    const parser = new markdown_ast_1.MarkdownParser();
    const ast = parser.parse(markdown);
    console.log('AST:', JSON.stringify(ast, null, 2));
    const generator = new textile_generator_1.TextileGenerator();
    const result = generator.generate(ast);
    return result;
}
// Test cases
console.log('Test 1: AB**C**.');
console.log('Input:', 'AB**C**.');
console.log('Output:', convert('AB**C**.'));
console.log('');
console.log('Test 2: AB*C*.');
console.log('Input:', 'AB*C*.');
console.log('Output:', convert('AB*C*.'));
console.log('');
console.log('Test 3: test**bold**text');
console.log('Input:', 'test**bold**text');
console.log('Output:', convert('test**bold**text'));
console.log('');
console.log('Test 4: A**B***C*D');
console.log('Input:', 'A**B***C*D');
console.log('Output:', convert('A**B***C*D'));
//# sourceMappingURL=debug-test.js.map