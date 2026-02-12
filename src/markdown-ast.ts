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
  | 'horizontalRule';

export interface ASTNode {
  type: NodeType;
  children?: ASTNode[];
  value?: string;
  level?: number; // for headings
  url?: string; // for links and images
  alt?: string; // for images
  ordered?: boolean; // for lists
  language?: string; // for code blocks
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
    this.advance(); // consume newline
    
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
  
  private parseList(): ASTNode {
    const isOrdered = /^\d+\./.test(this.peekLine());
    const items: ASTNode[] = [];
    
    while (this.pos < this.input.length && this.matchListStart()) {
      items.push(this.parseListItem(isOrdered));
    }
    
    return {
      type: 'list',
      ordered: isOrdered,
      children: items
    };
  }
  
  private parseListItem(isOrdered: boolean): ASTNode {
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
    
    const children = this.parseInline('\n');
    this.advance(); // consume newline
    
    return {
      type: 'listItem',
      children
    };
  }
  
  private parseParagraph(): ASTNode {
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
    
    while (this.pos < this.input.length && this.peek() !== until) {
      // Bold (**text** or __text__)
      if (this.match('**') || this.match('__')) {
        const marker = this.peek(2);
        this.advance(2);
        const children = this.parseInline(marker);
        this.advance(2);
        nodes.push({ type: 'bold', children });
        continue;
      }
      
      // Italic (*text* or _text_)
      if ((this.peek() === '*' && this.peek(2) !== '**') || 
          (this.peek() === '_' && this.peek(2) !== '__')) {
        const marker = this.peek();
        this.advance();
        const children = this.parseInline(marker);
        this.advance();
        nodes.push({ type: 'italic', children });
        continue;
      }
      
      // Inline code (`code`)
      if (this.peek() === '`') {
        this.advance();
        const value = this.readUntil('`');
        this.advance();
        nodes.push({ type: 'code', value });
        continue;
      }
      
      // Image (![alt](url))
      if (this.match('![')) {
        this.advance(2);
        const alt = this.readUntil(']');
        this.advance(); // ]
        this.advance(); // (
        const url = this.readUntil(')');
        this.advance(); // )
        nodes.push({ type: 'image', url, alt });
        continue;
      }
      
      // Link ([text](url))
      if (this.peek() === '[') {
        this.advance();
        const children = this.parseInline(']');
        this.advance(); // ]
        this.advance(); // (
        const url = this.readUntil(')');
        this.advance(); // )
        nodes.push({ type: 'link', url, children });
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
             this.peek() !== until && 
             !this.peek().match(/[\*_`\[\!]/)) {
        text += this.peek();
        this.advance();
      }
      
      if (text) {
        nodes.push({ type: 'text', value: text });
      }
    }
    
    return nodes;
  }
  
  private parseHorizontalRule(): ASTNode {
    this.skipToNextLine();
    return { type: 'horizontalRule' };
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
    const line = this.peekLine().trim();
    return /^[\-\*\+]\s/.test(line) || /^\d+\.\s/.test(line);
  }
  
  private matchHorizontalRule(): boolean {
    const line = this.peekLine().trim();
    return /^(\-{3,}|\*{3,}|_{3,})$/.test(line);
  }
}
