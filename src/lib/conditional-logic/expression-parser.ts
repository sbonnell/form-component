/**
 * Expression Parser for Conditional Rules
 *
 * Parses string expressions into ConditionalRule objects for evaluation.
 * Supports operators: ==, !=, >, >=, <, <=, in, not in, is empty, is not empty
 * Supports logical operators: &&, ||
 * Supports parentheses for grouping
 */

import type { ConditionalRule, ConditionOperator } from '@/types/schema';

/**
 * Parse a conditional expression string into a ConditionalRule
 *
 * @param expression - Expression string (e.g., "productType == 'physical' && quantity > 5")
 * @returns Parsed ConditionalRule object
 * @throws Error if expression cannot be parsed
 */
export function parseConditionalExpression(expression: string): ConditionalRule {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Expression must be a non-empty string');
  }

  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error('Expression cannot be empty');
  }

  try {
    const tokens = tokenize(trimmed);
    const ast = parseTokens(tokens);
    return ast;
  } catch (error) {
    throw new Error(`Failed to parse conditional expression "${expression}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Token types for the expression parser
 */
type TokenType =
  | 'IDENTIFIER'    // field names, function names
  | 'STRING'        // 'value' or "value"
  | 'NUMBER'        // 123, 45.67
  | 'BOOLEAN'       // true, false
  | 'LBRACKET'      // [
  | 'RBRACKET'      // ]
  | 'LPAREN'        // (
  | 'RPAREN'        // )
  | 'COMMA'         // ,
  | 'OPERATOR'      // ==, !=, >, >=, <, <=, in, not, is, empty
  | 'LOGICAL'       // &&, ||
  | 'EOF';          // end of input

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * Tokenize the expression string
 */
function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < expression.length) {
    const char = expression[position];

    // Skip whitespace
    if (/\s/.test(char)) {
      position++;
      continue;
    }

    // String literals
    if (char === '"' || char === "'") {
      const quote = char;
      let value = '';
      position++; // Skip opening quote

      while (position < expression.length && expression[position] !== quote) {
        if (expression[position] === '\\') {
          position++; // Skip escape character
          if (position < expression.length) {
            value += expression[position];
            position++;
          }
        } else {
          value += expression[position];
          position++;
        }
      }

      if (position >= expression.length) {
        throw new Error(`Unterminated string literal starting at position ${position - value.length - 1}`);
      }

      position++; // Skip closing quote
      tokens.push({ type: 'STRING', value, position: position - value.length - 2 });
      continue;
    }

    // Numbers
    if (/\d/.test(char) || (char === '.' && /\d/.test(expression[position + 1]))) {
      let value = '';

      // Integer part
      while (position < expression.length && /\d/.test(expression[position])) {
        value += expression[position];
        position++;
      }

      // Decimal part
      if (position < expression.length && expression[position] === '.') {
        value += expression[position];
        position++;

        while (position < expression.length && /\d/.test(expression[position])) {
          value += expression[position];
          position++;
        }
      }

      tokens.push({ type: 'NUMBER', value, position: position - value.length });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';

      while (position < expression.length && /[a-zA-Z0-9_]/.test(expression[position])) {
        value += expression[position];
        position++;
      }

      // Check for keywords
      if (value === 'true' || value === 'false') {
        tokens.push({ type: 'BOOLEAN', value, position: position - value.length });
      } else if (value === 'in' || value === 'not' || value === 'is' || value === 'empty') {
        tokens.push({ type: 'OPERATOR', value, position: position - value.length });
      } else {
        tokens.push({ type: 'IDENTIFIER', value, position: position - value.length });
      }
      continue;
    }

    // Operators and symbols
    switch (char) {
      case '(':
        tokens.push({ type: 'LPAREN', value: char, position });
        position++;
        break;
      case ')':
        tokens.push({ type: 'RPAREN', value: char, position });
        position++;
        break;
      case '[':
        tokens.push({ type: 'LBRACKET', value: char, position });
        position++;
        break;
      case ']':
        tokens.push({ type: 'RBRACKET', value: char, position });
        position++;
        break;
      case ',':
        tokens.push({ type: 'COMMA', value: char, position });
        position++;
        break;
      case '&':
        if (position + 1 < expression.length && expression[position + 1] === '&') {
          tokens.push({ type: 'LOGICAL', value: '&&', position });
          position += 2;
        } else {
          throw new Error(`Unexpected character '&' at position ${position}`);
        }
        break;
      case '|':
        if (position + 1 < expression.length && expression[position + 1] === '|') {
          tokens.push({ type: 'LOGICAL', value: '||', position });
          position += 2;
        } else {
          throw new Error(`Unexpected character '|' at position ${position}`);
        }
        break;
      case '=':
        if (position + 1 < expression.length && expression[position + 1] === '=') {
          tokens.push({ type: 'OPERATOR', value: '==', position });
          position += 2;
        } else {
          throw new Error(`Unexpected character '=' at position ${position}`);
        }
        break;
      case '!':
        if (position + 1 < expression.length && expression[position + 1] === '=') {
          tokens.push({ type: 'OPERATOR', value: '!=', position });
          position += 2;
        } else {
          throw new Error(`Unexpected character '!' at position ${position}`);
        }
        break;
      case '>':
        if (position + 1 < expression.length && expression[position + 1] === '=') {
          tokens.push({ type: 'OPERATOR', value: '>=', position });
          position += 2;
        } else {
          tokens.push({ type: 'OPERATOR', value: '>', position });
          position++;
        }
        break;
      case '<':
        if (position + 1 < expression.length && expression[position + 1] === '=') {
          tokens.push({ type: 'OPERATOR', value: '<=', position });
          position += 2;
        } else {
          tokens.push({ type: 'OPERATOR', value: '<', position });
          position++;
        }
        break;
      default:
        throw new Error(`Unexpected character '${char}' at position ${position}`);
    }
  }

  tokens.push({ type: 'EOF', value: '', position });
  return tokens;
}

/**
 * Parse tokens into a ConditionalRule AST
 */
function parseTokens(tokens: Token[]): ConditionalRule {
  let currentIndex = 0;

  function peek(): Token {
    return tokens[currentIndex];
  }

  function consume(): Token {
    const token = tokens[currentIndex];
    currentIndex++;
    return token;
  }

  function expect(type: TokenType): Token {
    const token = peek();
    if (token.type !== type) {
      throw new Error(`Expected ${type}, but found ${token.type} at position ${token.position}`);
    }
    return consume();
  }

  function parseExpression(): ConditionalRule {
    return parseLogicalOr();
  }

  function parseLogicalOr(): ConditionalRule {
    let left = parseLogicalAnd();

    while (peek().type === 'LOGICAL' && peek().value === '||') {
      consume(); // consume '||'
      const right = parseLogicalAnd();
      left = { or: [left, right] };
    }

    return left;
  }

  function parseLogicalAnd(): ConditionalRule {
    let left = parsePrimary();

    while (peek().type === 'LOGICAL' && peek().value === '&&') {
      consume(); // consume '&&'
      const right = parsePrimary();
      left = { and: [left, right] };
    }

    return left;
  }

  function parsePrimary(): ConditionalRule {
    const token = peek();

    if (token.type === 'LPAREN') {
      consume(); // consume '('
      const expr = parseExpression();
      expect('RPAREN'); // consume ')'
      return expr;
    }

    return parseComparison();
  }

  function parseComparison(): ConditionalRule {
    const fieldToken = expect('IDENTIFIER');
    let field = fieldToken.value;

    // Handle dot notation for nested fields
    while (peek().type === 'OPERATOR' && peek().value === '.') {
      consume(); // consume '.'
      const nextToken = expect('IDENTIFIER');
      field += '.' + nextToken.value;
    }

    const operatorToken = expect('OPERATOR');
    const operator = parseOperator(operatorToken);

    let value: any;

    if (operator === 'isEmpty' || operator === 'isNotEmpty') {
      // These operators don't take a value
      value = undefined;
    } else {
      value = parseValue();
    }

    return { field, operator, value };
  }

  function parseOperator(operatorToken: Token): ConditionOperator {
    const value = operatorToken.value;

    switch (value) {
      case '==':
        return 'equals';
      case '!=':
        return 'notEquals';
      case '>':
        return 'greaterThan';
      case '>=':
        return 'greaterThanOrEqual';
      case '<':
        return 'lessThan';
      case '<=':
        return 'lessThanOrEqual';
      case 'in':
        return 'in';
      case 'not':
        // Handle "not in" and "not empty"
        const nextToken1 = peek();
        if (nextToken1.type === 'OPERATOR' && nextToken1.value === 'in') {
          consume(); // consume 'in'
          return 'notIn';
        } else if (nextToken1.type === 'OPERATOR' && nextToken1.value === 'empty') {
          consume(); // consume 'empty'
          return 'isNotEmpty';
        } else {
          throw new Error(`Expected 'in' or 'empty' after 'not' at position ${nextToken1.position}`);
        }
      case 'is':
        // Handle "is empty"
        const nextToken2 = peek();
        if (nextToken2.type === 'OPERATOR' && nextToken2.value === 'empty') {
          consume(); // consume 'empty'
          return 'isEmpty';
        } else {
          throw new Error(`Expected 'empty' after 'is' at position ${nextToken2.position}`);
        }
      default:
        throw new Error(`Unknown operator '${value}' at position ${operatorToken.position}`);
    }
  }

  function parseValue(): any {
    const token = peek();

    switch (token.type) {
      case 'STRING':
        consume();
        return token.value;
      case 'NUMBER':
        consume();
        const num = parseFloat(token.value);
        return isNaN(num) ? token.value : num;
      case 'BOOLEAN':
        consume();
        return token.value === 'true';
      case 'LBRACKET':
        return parseArray();
      default:
        throw new Error(`Expected value, but found ${token.type} at position ${token.position}`);
    }
  }

  function parseArray(): any[] {
    expect('LBRACKET'); // consume '['
    const values: any[] = [];

    if (peek().type !== 'RBRACKET') {
      values.push(parseValue());

      while (peek().type === 'COMMA') {
        consume(); // consume ','
        values.push(parseValue());
      }
    }

    expect('RBRACKET'); // consume ']'
    return values;
  }

  const result = parseExpression();
  expect('EOF'); // ensure we've consumed all tokens

  return result;
}

/**
 * Validate that an expression can be parsed
 *
 * @param expression - Expression to validate
 * @returns true if expression is valid, false otherwise
 */
export function validateConditionalExpression(expression: string): boolean {
  try {
    parseConditionalExpression(expression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract field dependencies from a conditional expression
 *
 * @param expression - Expression string
 * @returns Array of field paths referenced in the expression
 */
export function extractConditionalDependencies(expression: string): string[] {
  try {
    const rule = parseConditionalExpression(expression);
    return extractFieldsFromRule(rule);
  } catch {
    return [];
  }
}

/**
 * Recursively extract field paths from a ConditionalRule
 */
function extractFieldsFromRule(rule: ConditionalRule): string[] {
  const fields: string[] = [];

  if (rule.field) {
    fields.push(rule.field);
  }

  if (rule.and) {
    for (const subRule of rule.and) {
      fields.push(...extractFieldsFromRule(subRule));
    }
  }

  if (rule.or) {
    for (const subRule of rule.or) {
      fields.push(...extractFieldsFromRule(subRule));
    }
  }

  return Array.from(new Set(fields));
}