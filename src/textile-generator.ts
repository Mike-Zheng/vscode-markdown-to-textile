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
    const value = (node.value || '').trim();
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
      if (!row.children) {
        return '';
      }
      
      const isFirstRow = rowIndex === 0 && hasHeaderRow;
      
      return '|' + row.children.map((cell, cellIndex) => {
        const content = this.generateInline(cell.children || [], true);
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
  
  private generateInline(nodes: ASTNode[], inTable: boolean = false): string {
    return nodes.map((node, index) => this.generateInlineNode(node, index, nodes, inTable)).join('');
  }
  
  private generateInlineNode(node: ASTNode, index: number, siblings: ASTNode[], inTable: boolean = false): string {
    switch (node.type) {
      case 'text':
        return node.value || '';
        
      case 'bold':
        // Textile bold: *text*
        // Add spaces inside markers if adjacent to non-space text
        return this.generateFormattedText(node, '*', index, siblings, inTable);
        
      case 'italic':
        // Textile italic: _text_
        // Add spaces inside markers if adjacent to non-space text
        return this.generateFormattedText(node, '_', index, siblings, inTable);
        
      case 'code':
        // In tables, use simple @ notation
        // Outside tables, use Redmine inline code with background color
        if (inTable) {
          return '@' + (node.value || '') + '@';
        }
        
        // Redmine inline code with background color
        // Escape % characters to avoid Textile parsing issues
        const escapedCode = (node.value || '').replace(/%/g, '&#37;');
        const codeContent = '%{font-size: 0.85em;padding: 0.2em 0.4em;background-color: #656c7633;border-radius: 3px;font-weight:bold;}' + escapedCode + '%';
        
        // Check if we need to add space before/after the inline code
        const prevNode = index > 0 ? siblings[index - 1] : null;
        const nextNode = index < siblings.length - 1 ? siblings[index + 1] : null;
        
        // Add space before if previous text ends with non-space character
        const needSpaceBefore = prevNode && 
                               prevNode.type === 'text' && 
                               prevNode.value && 
                               !/\s$/.test(prevNode.value);
        
        // Add space after if next text starts with non-space character
        const needSpaceAfter = nextNode && 
                              nextNode.type === 'text' && 
                              nextNode.value && 
                              !/^\s/.test(nextNode.value);
        
        const spaceBefore = needSpaceBefore ? ' ' : '';
        const spaceAfter = needSpaceAfter ? ' ' : '';
        
        return spaceBefore + codeContent + spaceAfter;
        
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
  
  private generateFormattedText(node: ASTNode, marker: string, index: number, siblings: ASTNode[], inTable: boolean = false): string {
    const content = this.generateInline(node.children || [], inTable);
    
    // Check if we need to add space before/after markers
    // Textile requires spaces outside markers when adjacent to word characters (not punctuation)
    // Example: text,*bold*. is wrong → text, *bold*. is correct
    //          text*bold*text is wrong → text *bold* text is correct
    
    const prevNode = index > 0 ? siblings[index - 1] : null;
    const nextNode = index < siblings.length - 1 ? siblings[index + 1] : null;
    
    // Add space before if previous text ends with non-space character (letter, digit, or punctuation)
    // But Textile renders correctly when punctuation is followed by marker, so we add space after punctuation too
    const needSpaceBefore = prevNode && 
                           prevNode.type === 'text' && 
                           prevNode.value && 
                           !/\s$/.test(prevNode.value);
    
    // Add space after only if next text starts with word character (not space, not punctuation)
    const needSpaceAfter = nextNode && 
                          nextNode.type === 'text' && 
                          nextNode.value && 
                          !/^[\s\p{P}]/u.test(nextNode.value);
    
    const spaceBefore = needSpaceBefore ? ' ' : '';
    const spaceAfter = needSpaceAfter ? ' ' : '';
    
    // Space goes outside the markers: text, *bold* text
    return spaceBefore + marker + content + marker + spaceAfter;
  }
}
