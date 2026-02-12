// Markdown AST 節點型別
export type NodeType = 
  | 'document'
  | 'heading'
  | 'paragraph'
  | 'bold'
  | 'italic'
  | 'code'
  | 'link'
  | 'image'
  | 'list'
  | 'listItem'
  | 'blockquote'
  | 'codeBlock'
  | 'text'
  | 'lineBreak'
  | 'horizontalRule'
  | 'table'
  | 'tableRow'
  | 'tableCell';

export interface ASTNode {
  type: NodeType;
  children?: ASTNode[];
  value?: string;
  level?: number; // for headings
  url?: string; // for links and images
  alt?: string; // for images
  ordered?: boolean; // for lists
  language?: string; // for code blocks
  isHeader?: boolean; // for table cells
  align?: 'left' | 'center' | 'right'; // for table cells
  depth?: number; // for nested lists
}

export class MarkdownParser {
  private pos: number = 0;
  private input: string = '';
  
  parse(markdown: string): ASTNode {
    this.input = markdown;
    this.pos = 0;
    
    const document: ASTNode = {
      type: 'document',
      children: []
    };
    
    while (this.pos < this.input.length) {
      const node = this.parseBlock();
      if (node) {
        document.children!.push(node);
      }
    }
    
    return document;
  }
  
  private parseBlock(): ASTNode | null {
    this.skipWhitespace();
    
    if (this.pos >= this.input.length) {
      return null;
    }
    
    // 空行
    if (this.peek() === '\n') {
      this.advance();
      return null;
    }
    
    // Horizontal rule (---, ***, ___)
    if (this.matchHorizontalRule()) {
      return this.parseHorizontalRule();
    }
    
    // Table
    if (this.matchTableStart()) {
      return this.parseTable();
    }
    
    // Heading
    if (this.peek() === '#') {
      return this.parseHeading();
    }
    
    // Code block (```)
    if (this.match('```')) {
      return this.parseCodeBlock();
    }
    
    // Blockquote
    if (this.peek() === '>') {
      return this.parseBlockquote();
    }
    
    // List
    if (this.matchListStart()) {
      return this.parseList();
    }
    
    // Paragraph (default)
    return this.parseParagraph();
  }
  
  private parseHeading(): ASTNode {
    let level = 0;
    while (this.peek() === '#' && level < 6) {
      level++;
      this.advance();
    }
    
    this.skipSpaces();
    
    const children = this.parseInline('\n');
    if (this.peek() === '\n') {
      this.advance(); // consume newline
    }
    
    return {
      type: 'heading',
      level,
      children
    };
  }
  
  private parseCodeBlock(): ASTNode {
    this.consume('```');
    
    // Parse language
    const language = this.readUntil('\n');
    this.advance();
    
    // Parse code content
    const value = this.readUntil('```');
    this.consume('```');
    this.skipToNextLine();
    
    return {
      type: 'codeBlock',
      language: language.trim() || undefined,
      value
    };
  }
  
  private parseBlockquote(): ASTNode {
    const lines: string[] = [];
    
    while (this.pos < this.input.length && this.peek() === '>') {
      this.advance(); // consume '>'
      this.skipSpaces();
      
      const line = this.readUntil('\n');
      lines.push(line);
      
      if (this.peek() === '\n') {
        this.advance();
      }
      
      // Check if next line is also a blockquote
      if (this.peek() !== '>') {
        break;
      }
    }
    
    const content = lines.join('\n');
    const parser = new MarkdownParser();
    const parsed = parser.parse(content);
    
    return {
      type: 'blockquote',
      children: parsed.children
    };
  }
  
  private parseList(baseIndent: number = 0): ASTNode {
    const isOrdered = /^\d+\./.test(this.peekLine().trimStart());
    const items: ASTNode[] = [];
    
    while (this.pos < this.input.length) {
      // Check current line indentation
      const indent = this.getIndentation();
      // If indentation is less than base, we're done with this list
      if (indent < baseIndent) {
        break;
      }
      
      // If indentation is more than base, skip (nested list handled in parseListItem)
      if (indent > baseIndent) {
        break;
      }
      
      // Check if this is the same type of list
      const currentLineOrdered = /^\d+\./.test(this.peekLine().trimStart());
      
      // If list type changed, stop
      if (currentLineOrdered !== isOrdered) {
        break;
      }
      
      // If not a list start, stop
      if (!this.matchListStart()) {
        break;
      }
      
      // Consume the indentation spaces for this level
      for (let i = 0; i < baseIndent; i++) {
        if (this.peek() === ' ' || this.peek() === '\t') {
          this.advance();
        }
      }
      
      items.push(this.parseListItem(isOrdered, baseIndent));
      
      // Stop if we hit a double newline (empty line)
      if (this.match('\n\n')) {
        break;
      }
    }
    
    return {
      type: 'list',
      ordered: isOrdered,
      children: items
    };
  }
  
  private parseListItem(isOrdered: boolean, baseIndent: number): ASTNode {
    // Consume list marker
    if (isOrdered) {
      while (this.peek() !== '.') {
        this.advance();
      }
      this.advance(); // consume '.'
    } else {
      this.advance(); // consume '-', '*', or '+'
    }
    
    this.skipSpaces();
    
    const children: ASTNode[] = [];
    const inlineContent = this.parseInline('\n');
    children.push(...inlineContent);
    
    if (this.peek() === '\n') {
      this.advance(); // consume newline
    }
    
    // Check for nested list
    while (this.pos < this.input.length) {
      const nextIndent = this.getIndentation();
      
      // If next line has more indentation and is a list, it's nested
      if (nextIndent > baseIndent && this.matchListStart()) {
        const nestedList = this.parseList(nextIndent);
        children.push(nestedList);
      } else {
        break;
      }
    }
    
    return {
      type: 'listItem',
      children
    };
  }
  
  private parseParagraph(): ASTNode {
    // Check if line starts with heading marker that wasn't caught
    const line = this.peekLine();
    if (/^#{1,6}\s/.test(line)) {
      return this.parseHeading();
    }
    
    const children = this.parseInline('\n');
    
    if (this.peek() === '\n') {
      this.advance();
    }
    
    return {
      type: 'paragraph',
      children
    };
  }
  
  private parseInline(until: string): ASTNode[] {
    const nodes: ASTNode[] = [];
    
    while (this.pos < this.input.length && !this.match(until)) {
      const startPos = this.pos; // Track starting position
      
      // Bold (**text** or __text__)
      if (this.match('**') || this.match('__')) {
        const marker = this.peek(2);
        this.advance(2);
        const children = this.parseInline(marker);
        if (this.match(marker)) {
          this.advance(2);
        }
        nodes.push({ type: 'bold', children });
        continue;
      }
      
      // Italic (*text* or _text_)
      if ((this.peek() === '*' && !this.match('**')) || 
          (this.peek() === '_' && !this.match('__'))) {
        const marker = this.peek();
        this.advance();
        const children = this.parseInline(marker);
        if (this.peek() === marker) {
          this.advance();
        }
        nodes.push({ type: 'italic', children });
        continue;
      }
      
      // Inline code (`code` or ``code with ` inside``)
      if (this.peek() === '`') {
        // Count the number of backticks (limit to reasonable number)
        let backtickCount = 0;
        let startPos = this.pos;
        while (this.pos < this.input.length && this.peek() === '`' && backtickCount < 10) {
          backtickCount++;
          this.advance();
        }
        
        // Read until we find the same number of backticks
        let value = '';
        let found = false;
        let searchPos = this.pos;
        while (searchPos < this.input.length) {
          // Check if we found matching backticks
          let matchCount = 0;
          let checkPos = searchPos;
          while (checkPos < this.input.length && 
                 this.input[checkPos] === '`' && 
                 matchCount < backtickCount) {
            matchCount++;
            checkPos++;
          }
          
          if (matchCount === backtickCount) {
            // Found matching backticks
            value = this.input.substring(this.pos, searchPos);
            this.pos = checkPos;
            found = true;
            break;
          }
          
          // Not a match, continue searching
          searchPos++;
        }
        
        if (found) {
          // Trim leading/trailing spaces if backtick count > 1
          if (backtickCount > 1 && value) {
            value = value.trim();
          }
          nodes.push({ type: 'code', value });
        } else {
          // No closing backticks found, treat first backtick as literal text
          this.pos = startPos;
          this.advance(); // Move past the first backtick
          nodes.push({ type: 'text', value: '`' });
        }
        continue;
      }
      
      // Image (![alt](url))
      if (this.match('![')) {
        this.advance(2);
        const alt = this.readUntil(']');
        this.advance(); // ]
        if (this.peek() === '(') {
          this.advance(); // (
          const url = this.readUntil(')');
          this.advance(); // )
          nodes.push({ type: 'image', url, alt });
        } else {
          // Not a valid image, treat as text
          nodes.push({ type: 'text', value: '![' + alt + ']' });
        }
        continue;
      }
      
      // Link ([text](url))
      if (this.peek() === '[') {
        this.advance();
        const children = this.parseInline(']');
        this.advance(); // ]
        if (this.peek() === '(') {
          this.advance(); // (
          const url = this.readUntil(')');
          this.advance(); // )
          nodes.push({ type: 'link', url, children });
        } else {
          // Not a valid link, treat as text
          nodes.push({ type: 'text', value: '[' });
          nodes.push(...children);
          nodes.push({ type: 'text', value: ']' });
        }
        continue;
      }
      
      // Line break (two spaces + newline)
      if (this.match('  \n')) {
        this.advance(3);
        nodes.push({ type: 'lineBreak' });
        continue;
      }
      
      // Plain text
      let text = '';
      while (this.pos < this.input.length && 
             !this.match(until) && 
             !this.peek().match(/[\*_`\[\!]/)) {
        text += this.peek();
        this.advance();
      }
      
      if (text) {
        nodes.push({ type: 'text', value: text });
      }
      
      // Safety check: if position hasn't moved, force advance to prevent infinite loop
      if (this.pos === startPos) {
        nodes.push({ type: 'text', value: this.peek() });
        this.advance();
      }
    }
    
    return nodes;
  }
  
  private parseHorizontalRule(): ASTNode {
    this.skipToNextLine();
    return { type: 'horizontalRule' };
  }
  
  private parseTable(): ASTNode {
    const rows: ASTNode[] = [];
    
    while (this.pos < this.input.length && this.matchTableStart()) {
      rows.push(this.parseTableRow());
    }
    
    return {
      type: 'table',
      children: rows
    };
  }
  
  private parseTableRow(): ASTNode {
    const cells: ASTNode[] = [];
    let isHeader = false;
    
    // Skip leading whitespace
    this.skipWhitespace();
    
    // Consume opening |
    if (this.peek() === '|') {
      this.advance();
    }
    
    const line = this.peekLine();
    
    // Check if this is a separator row (e.g., |---|---|
    if (this.matchTableSeparator(line)) {
      // Parse alignment from separator
      const alignments = this.parseTableAlignments(line);
      this.skipToNextLine();
      // Return a special row to indicate header
      return {
        type: 'tableRow',
        children: alignments.map(align => ({
          type: 'tableCell',
          isHeader: true,
          align,
          children: []
        }))
      };
    }
    
    // Parse cells
    while (this.pos < this.input.length && this.peek() !== '\n') {
      let cellContent = '';
      
      // Read until | or newline
      while (this.pos < this.input.length && this.peek() !== '|' && this.peek() !== '\n') {
        cellContent += this.peek();
        this.advance();
      }
      
      // Only add cell if we have content or if it's not the last character
      const cellContentTrimmed = cellContent.trim();
      
      if (cellContentTrimmed || this.peek() === '|') {
        // Parse cell content as inline
        const parser = new MarkdownParser();
        const cellAST = parser.parse(cellContentTrimmed);
        const children = cellAST.children && cellAST.children.length > 0 && cellAST.children[0].type === 'paragraph'
          ? cellAST.children[0].children || []
          : [{ type: 'text' as NodeType, value: cellContentTrimmed }];
        
        cells.push({
          type: 'tableCell',
          children
        });
      }
      
      // Consume |
      if (this.peek() === '|') {
        this.advance();
        // If next char is newline, break (don't add empty cell)
        if (this.peek() === '\n') {
          break;
        }
      }
    }
    
    // Consume newline
    if (this.peek() === '\n') {
      this.advance();
    }
    
    return {
      type: 'tableRow',
      children: cells
    };
  }
  
  private matchTableSeparator(line: string): boolean {
    return /^\|?\s*:?-+:?\s*\|/.test(line);
  }
  
  private parseTableAlignments(line: string): Array<'left' | 'center' | 'right'> {
    const cells = line.split('|').filter(c => c.trim());
    return cells.map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
        return 'center';
      } else if (trimmed.endsWith(':')) {
        return 'right';
      } else {
        return 'left';
      }
    });
  }
  
  // Helper methods
  private peek(length: number = 1): string {
    return this.input.substr(this.pos, length);
  }
  
  private peekLine(): string {
    const newlinePos = this.input.indexOf('\n', this.pos);
    if (newlinePos === -1) {
      return this.input.substr(this.pos);
    }
    return this.input.substring(this.pos, newlinePos);
  }
  
  private advance(count: number = 1): void {
    this.pos += count;
  }
  
  private match(str: string): boolean {
    return this.input.substr(this.pos, str.length) === str;
  }
  
  private consume(str: string): void {
    if (this.match(str)) {
      this.advance(str.length);
    }
  }
  
  private readUntil(delimiter: string): string {
    const start = this.pos;
    while (this.pos < this.input.length && !this.match(delimiter)) {
      this.advance();
    }
    return this.input.substring(start, this.pos);
  }
  
  private skipWhitespace(): void {
    while (this.pos < this.input.length && this.peek().match(/[ \t\r]/)) {
      this.advance();
    }
  }
  
  private skipSpaces(): void {
    while (this.pos < this.input.length && this.peek() === ' ') {
      this.advance();
    }
  }
  
  private skipToNextLine(): void {
    while (this.pos < this.input.length && this.peek() !== '\n') {
      this.advance();
    }
    if (this.peek() === '\n') {
      this.advance();
    }
  }
  
  private matchListStart(): boolean {
    const line = this.peekLine().trimStart();
    return /^[\-\*\+]\s/.test(line) || /^\d+\.\s/.test(line);
  }
  
  private getIndentation(): number {
    let indent = 0;
    let tempPos = this.pos;
    while (tempPos < this.input.length && (this.input[tempPos] === ' ' || this.input[tempPos] === '\t')) {
      if (this.input[tempPos] === '\t') {
        indent += 2; // Count tab as 2 spaces
      } else {
        indent++;
      }
      tempPos++;
    }
    return indent;
  }
  
  private matchHorizontalRule(): boolean {
    const line = this.peekLine().trim();
    return /^(\-{3,}|\*{3,}|_{3,})$/.test(line);
  }
  
  private matchTableStart(): boolean {
    const line = this.peekLine().trim();
    return line.startsWith('|') || /^\|.*\|/.test(line);
  }
}
