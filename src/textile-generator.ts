import { ASTNode } from './markdown-ast';

export class TextileGenerator {
  generate(ast: ASTNode): string {
    if (ast.type === 'document') {
      return this.generateDocument(ast);
    }
    return '';
  }
  
  private generateDocument(node: ASTNode): string {
    if (!node.children) {
      return '';
    }
    
    return node.children
      .map(child => this.generateBlock(child))
      .filter(text => text !== '')
      .join('\n\n');
  }
  
  private generateBlock(node: ASTNode): string {
    switch (node.type) {
      case 'heading':
        return this.generateHeading(node);
      case 'paragraph':
        return this.generateParagraph(node);
      case 'codeBlock':
        return this.generateCodeBlock(node);
      case 'blockquote':
        return this.generateBlockquote(node);
      case 'list':
        return this.generateList(node);
      case 'table':
        return this.generateTable(node);
      case 'horizontalRule':
        return '---';
      default:
        return '';
    }
  }
  
  private generateHeading(node: ASTNode): string {
    const level = node.level || 1;
    const prefix = 'h' + level + '. ';
    const content = this.generateInline(node.children || []);
    return prefix + content;
  }
  
  private generateParagraph(node: ASTNode): string {
    return this.generateInline(node.children || []);
  }
  
  private generateCodeBlock(node: ASTNode): string {
    // Redmine Textile code block format: <pre><code class="language">
    const value = node.value || '';
    const language = node.language || '';
    
    if (language) {
      return `<pre><code class="${language}">\n${value}\n</code></pre>`;
    } else {
      return `<pre><code>\n${value}\n</code></pre>`;
    }
  }
  
  private generateBlockquote(node: ASTNode): string {
    if (!node.children) {
      return '';
    }
    
    // Textile blockquote: bq. text
    const lines = node.children.map(child => {
      if (child.type === 'paragraph') {
        return 'bq. ' + this.generateInline(child.children || []);
      }
      return this.generateBlock(child);
    });
    
    return lines.join('\n');
  }
  
  private generateList(node: ASTNode): string {
    if (!node.children) {
      return '';
    }
    
    const marker = node.ordered ? '#' : '*';
    
    return node.children
      .map((item, index) => {
        if (item.type === 'listItem') {
          const content = this.generateInline(item.children || []);
          return marker + ' ' + content;
        }
        return '';
      })
      .join('\n');
  }
  
  private generateTable(node: ASTNode): string {
    if (!node.children) {
      return '';
    }
    
    let hasHeaderRow = false;
    let alignments: Array<'left' | 'center' | 'right'> = [];
    const rows = node.children.filter(child => child.type === 'tableRow');
    
    // Check if second row is a separator (alignment row)
    if (rows.length >= 2 && rows[1].children) {
      const secondRow = rows[1];
      if (secondRow.children && secondRow.children.every(cell => cell.isHeader)) {
        hasHeaderRow = true;
        alignments = secondRow.children.map(cell => cell.align || 'left');
        rows.splice(1, 1); // Remove separator row
      }
    }
    
    return rows.map((row, rowIndex) => {
      if (!row.children) return '';
      
      const isFirstRow = rowIndex === 0 && hasHeaderRow;
      
      return '|' + row.children.map((cell, cellIndex) => {
        const content = this.generateInline(cell.children || []);
        const align = alignments[cellIndex] || 'left';
        
        if (isFirstRow) {
          // Header cell
          return '_.  ' + content + ' ';
        } else {
          // Regular cell with alignment
          const alignPrefix = align === 'center' ? '=. ' : align === 'right' ? '>. ' : '';
          return alignPrefix + content;
        }
      }).join('|') + '|';
    }).join('\n');
  }
  
  private generateInline(nodes: ASTNode[]): string {
    return nodes.map(node => this.generateInlineNode(node)).join('');
  }
  
  private generateInlineNode(node: ASTNode): string {
    switch (node.type) {
      case 'text':
        return node.value || '';
        
      case 'bold':
        // Textile bold: *text*
        return '*' + this.generateInline(node.children || []) + '*';
        
      case 'italic':
        // Textile italic: _text_
        return '_' + this.generateInline(node.children || []) + '_';
        
      case 'code':
        // Textile inline code: @code@
        return '@' + (node.value || '') + '@';
        
      case 'link':
        // Textile link: "link text":url
        const linkText = this.generateInline(node.children || []);
        return '"' + linkText + '":' + (node.url || '');
        
      case 'image':
        // Textile image: !url(alt text)!
        const alt = node.alt || '';
        return '!' + (node.url || '') + (alt ? '(' + alt + ')' : '') + '!';
        
      case 'lineBreak':
        // Textile line break
        return '\n';
        
      default:
        return '';
    }
  }
}
