import { join } from 'node:path';
import process from 'node:process';
import { Color, type ColorCode, darkGrey, getColor } from './color.js';

export const ICON = '⚡';
export const icon = (text: string) => `${ICON}${text}`;

const CTX_MAP = new Map<string, unknown>();
export const setCtx = <T>(key: string, value: T) => {
  CTX_MAP.set(key, value);

  return () => {
    CTX_MAP.delete(key);
  };
};
export const getCtx = <T>(key: string): T => {
  return CTX_MAP.get(key) as never;
};

export type NormalizedPattern = {
  name: string;
  path: string;
  paths: string[];
};

export function normalize(pattern: string): NormalizedPattern {
  const paths = pattern.replace(/^\.\//, '').split('/');
  const name = paths.filter((p) => !p.includes('*')).join('.');
  const path = join(...paths.filter((p) => p && !p.includes('*')));
  return { name, path, paths };
}

export const bgn = {
  green: (text: string) => {
    return `\x1b[42m${fgn.black(fgn.clear(text))}\x1b[0m`;
  },
  white: (text: string) => {
    return `\x1b[47m${fgn.black(fgn.clear(text))}\x1b[0m`;
  },
  blue: (text: string) => {
    return `\x1b[44m${fgn.black(fgn.clear(text))}\x1b[0m`;
  },
  cyan: (text: string) => {
    return `\x1b[46m${fgn.black(fgn.clear(text))}\x1b[0m`;
  },
};

export const fgn = {
  line: () => {
    console.log(fgn.grey('-------------------------------------------------------------------'));
  },
  indent(text: string, max: number, fill = ' ') {
    return text.padStart(max, fill);
  },
  black: (text: string, prefix?: string) => {
    return `\x1b[30m${prefix ?? ''}${text}\x1b[0m`;
  },
  clear: (text: string) => {
    // eslint-disable-next-line no-control-regex
    const ansiRegex = /\x1b\[[0-9;]*m/g;
    return text.replace(ansiRegex, '');
  },
  green: (text: string, prefix?: string) => {
    return `\x1b[32m${prefix ?? ''}${text}\x1b[0m`;
  },
  red: (text: string, prefix?: string) => {
    return `\x1b[31m${prefix ?? ''}${text}\x1b[0m`;
  },
  grey: (text: string, prefix?: string) => {
    return `\x1b[90m${prefix ?? ''}${text}\x1b[0m`;
  },
  yellow: (text: string, prefix?: string) => {
    return `\x1b[33m${prefix ?? ''}${text}\x1b[0m`;
  },
  blue: (text: string, prefix?: string) => {
    return `\x1b[38;5;117m${prefix ?? ''}${text}\x1b[0m`;
  },
  lightGrey: (text: string, prefix?: string) => {
    return `\x1b[38;5;248m${prefix ?? ''}${text}\x1b[0m`;
  },
  cyan: (text: string, prefix?: string) => {
    return `\x1b[36m${prefix ?? ''}${text}\x1b[0m`;
  },
  bold: (text: string, prefix?: string) => {
    return `\x1b[1m${prefix ?? ''}${text}\x1b[0m`;
  },
  padding: (text: string, prefix?: string) => {
    text = fgn.clear(text);
    return [prefix ?? '', ...Array.from({ length: text.length }).fill(' ')].join('');
  },
  wrap: (text: string, prefix?: string, padNext?: string) => {
    const cleanPref = fgn.clear(prefix ?? '');
    const width = (process.stdout.columns ?? 80) - cleanPref.length - 10;
    const lines = [];
    const texts = text.split(' ');
    let currentLine = '';

    for (const word of texts) {
      if (fgn.clear(currentLine).length + fgn.clear(word).length > width) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = `${currentLine} ${word}`;
      }
    }

    if (currentLine.trim()) lines.push(currentLine.trim());

    return lines
      .map((row, i) => {
        if (i === 0) {
          return `${prefix ?? ''}${row}`;
        } else {
          return padNext ? `${' '.repeat(cleanPref.length - 1) + padNext}${row}` : `${prefix}${row}`;
        }
      })
      .join('\n');
  },
  rotator: (base: number) => {
    return (text: string, prefix?: string) => {
      const colorCode = (base + text.length) % 256;
      return `\x1b[38;5;${colorCode}m${prefix ?? ''}${text}\x1b[0m`;
    };
  },
};

const INDENT_SPACES = 2;

export const align = (text: string, maxRefs: number | string[], fill = ' ') => {
  if (typeof maxRefs === 'number') {
    return text.padEnd(maxRefs, fill);
  }

  const max =
    maxRefs.reduce((acc: number, text: string) => {
      return Math.max(acc, text.length);
    }, 0) + 1;

  return text
    .split('\n')
    .map((t) => t.padEnd(max))
    .join('\n');
};

export const clear = (text: string) => {
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  return text.replace(ansiRegex, '');
};

export const wrap = (text: string, width: number = process.stdout.columns ?? 80, indent = 0, fill = ' ') => {
  const lines = [];
  const texts = text.split(' ');
  const maxWidth = width - indent;
  let nextLine = '';

  for (const word of texts) {
    if (clear(nextLine).length + clear(word).length > maxWidth) {
      lines.push(nextLine.trim());
      nextLine = word;
    } else {
      nextLine = `${nextLine} ${word}`;
    }
  }

  if (nextLine.trim()) lines.push(nextLine.trim());

  return lines
    .map((line, i) => {
      return i === 0 ? line : fill.repeat(indent) + line;
    })
    .map((line) => line.padEnd(width, fill));
};

export const stylize = (text: string, style: TextStyle) => {
  if (Object.keys(style).length) {
    const parts = ['\x1b['];

    if (style.bold) parts.push('1');
    if (style.italic) parts.push('3');
    if (style.underline) parts.push('4');
    if (style.strike) parts.push('9');
    if (style.fill) parts.push(`48;5;${getColor(style.fill)}`);
    if (style.color) parts.push(`38;5;${getColor(style.color)}`);

    return `${parts.join(';')}m${text}\x1b[0m`;
  }

  return text;
};

export type TextStyle = {
  fill?: number | ColorCode;
  color?: number | ColorCode;
  width?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
};

export enum TreeSign {
  BEGIN = '┌',
  MIDDLE = '├',
  END = '└',
  FILLED = '│',
  DASHED = '┊',
  WARNING = '⚠',
}

export enum Spacer {
  MUTE = '',
  SPACE = ' ',
  DASH = '─',
  DOT = '•',
  BULLET = '●',
}

const maxLength = (texts: number | string[]) => {
  if (typeof texts === 'number') return texts;
  return texts.reduce((acc: number, text: string) => {
    return Math.max(acc, text.length);
  }, 0);
};

export class Text {
  public prefix = '';
  public suffix = '';
  public lines: string[];

  public get length() {
    return clear(this.lines.join('')).length;
  }

  constructor(
    text: string,
    public style: TextStyle = {}
  ) {
    this.lines = text.split('\n');
  }

  public align(maxRefs: number | string[], spacer = Spacer.SPACE) {
    this.lines = this.lines.map((line) => {
      return line
        .split('\n')
        .map((line) => {
          return line.padEnd(maxLength(maxRefs), spacer);
        })
        .join('\n');
    });

    return this;
  }

  public left(maxRefs: number | string[], spacer = Spacer.SPACE) {
    this.lines = this.lines.map((line) => {
      return line
        .split('\n')
        .map((line) => {
          return line.padStart(maxLength(maxRefs), spacer);
        })
        .join('\n');
    });

    return this;
  }

  public center(maxRefs: number | string[], spacer = Spacer.SPACE) {
    this.lines = this.lines.map((line) => {
      return line
        .split('\n')
        .map((line) => {
          const max = maxLength(maxRefs) - line.length;
          const bgn = Math.ceil(max / 2);
          return line.padStart(bgn + line.length, spacer).padEnd(max, spacer);
        })
        .join('\n');
    });

    return this;
  }

  public indent(level = 0, spacer = Spacer.SPACE) {
    this.lines = this.lines.map((line) => {
      return line
        .split('\n')
        .map((line) => {
          return ` ${line}`.padStart(level * INDENT_SPACES + line.length, spacer);
        })
        .join('\n');
    });

    return this;
  }

  public padding(padding: number, spacer = Spacer.SPACE) {
    this.lines = this.lines.map((line) => {
      return line
        .split('\n')
        .map((line) => {
          return spacer.repeat(padding) + line + spacer.repeat(padding);
        })
        .join('\n');
    });

    return this;
  }

  public wrap(width: number, indent = 0, spacer = Spacer.SPACE) {
    this.lines = this.lines.map((line) => {
      return wrap(line, width, indent, spacer).join('\n');
    });

    return this;
  }

  public beginTree(level = 0, color = Color.DARK_GREY, spacer = Spacer.DASH) {
    return this.tree(level, TreeSign.BEGIN, color, spacer);
  }

  public tree(level = 0, sign = TreeSign.MIDDLE, color = Color.DARK_GREY, spacer = Spacer.DASH) {
    this.prefix = stylize(sign.padEnd(level * INDENT_SPACES + 1, spacer), { color: color }) + ' ';
    return this;
  }

  public lineTree(level = 0, color = Color.DARK_GREY, spacer = Spacer.SPACE) {
    return this.tree(level, TreeSign.FILLED, color, spacer);
  }

  public endTree(level = 0, fg = Color.DARK_GREY, spacer = Spacer.DASH) {
    return this.tree(level, TreeSign.END, fg, spacer);
  }

  public list(level = 0, fg = Color.DARK_GREY, spacer = Spacer.SPACE) {
    this.prefix = stylize(Spacer.DOT.padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public bullet(level = 0, fg = Color.DARK_GREY, spacer = Spacer.SPACE) {
    this.prefix = stylize(Spacer.BULLET.padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public text() {
    return this.lines
      .map((line) => {
        return line
          .split('\n')
          .map((line) => {
            const columns = [this.prefix, stylize(line, this.style), this.suffix];

            return columns.filter((c) => c).join('');
          })
          .join('\n');
      })
      .join('\n');
  }

  public color(fg: number | ColorCode) {
    this.style.color = fg;
    return this;
  }

  public fill(bg: number | ColorCode) {
    this.style.fill = bg;
    return this;
  }

  public red() {
    this.style.color = Color.RED;
    return this;
  }

  public green() {
    this.style.color = Color.GREEN;
    return this;
  }

  public blue() {
    this.style.color = Color.BLUE;
    return this;
  }

  public grey() {
    this.style.color = Color.GREY;
    return this;
  }

  public yellow() {
    this.style.color = Color.YELLOW;
    return this;
  }

  public darkGrey() {
    this.style.color = Color.DARK_GREY;
    return this;
  }

  public darkGreen() {
    this.style.color = Color.DARK_GREEN;
    return this;
  }

  public darkYellow() {
    this.style.color = Color.DARK_YELLOW;
    return this;
  }

  public lightGrey() {
    this.style.color = Color.LIGHT_GREY;
    return this;
  }

  public cyan() {
    this.style.color = Color.CYAN;
    return this;
  }

  public pink() {
    this.style.color = Color.PINK;
    return this;
  }

  public purple() {
    this.style.color = Color.PURPLE;
    return this;
  }

  public orange() {
    this.style.color = Color.ORANGE;
    return this;
  }

  public skyBlue() {
    this.style.color = Color.SKY_BLUE;
    return this;
  }

  public bold() {
    this.style.bold = true;
    return this;
  }

  public italic() {
    this.style.italic = true;
    return this;
  }

  public underline() {
    this.style.underline = true;
    return this;
  }

  public strike() {
    this.style.strike = true;
    return this;
  }
}

/**
 * Create a new Text instance.
 * @param {string} text
 * @param {TextStyle} style
 * @returns {Text}
 */
export const txt = (text: string, style: TextStyle = {}): Text => new Text(text, style);

/**
 * Convert an array of text into a single string.
 * @param {string | Text | Array<Text | string>} text
 * @param {string} separator
 * @returns {string}
 */
export const inline = (text: string | Text | Array<Text | string>, separator: string = Spacer.MUTE): string => {
  if (!Array.isArray(text)) {
    return inline([text]);
  }

  return text
    .map((child) => {
      return child instanceof Text ? child.text() : child;
    })
    .join(separator);
};

/**
 * Convert an array of text into a single string using spaces as separator.
 * @param {string | Text | Array<Text | string>} text
 * @param {string} separator
 * @returns {string}
 */
export const column = (text: string | Text | Array<Text | string>, separator: string = Spacer.SPACE): string => {
  return inline(text, separator);
};

/**
 * Convert an array of text into a single string using new lines as separator.
 * @param {string | Text | Array<string | Text>} text
 * @returns {string}
 */
export const section = (text: string | Text | Array<string | Text>): string => {
  return inline(text, '\n');
};

/**
 * Render text to console.
 * @param {string | Text | Array<string | Text>} children
 * @param {string} separator
 * @returns {void}
 */
export const render = (children: string | Text | Array<Text | string>, separator: string = Spacer.MUTE): void => {
  console.log(inline(children, separator));
};

/**
 * Render text to console in columns.
 * @param {string | Text | Array<Text | string>} children
 * @param {string} separator
 */
export const renderCol = (children: string | Text | Array<Text | string>, separator: string = Spacer.SPACE): void => {
  console.log(inline(children, separator));
};

/**
 * Render text to console with new line separator.
 * @param {string | Text | Array<string | Text>} children
 * @returns {void}
 */
export const renderLine = (children: string | Text | Array<string | Text>): void => {
  return render(children, '\n');
};

/**
 * Create a new line in the console.
 * @param {boolean} dashed
 * @param {Spacer} fill
 */
export const newLine = (dashed: boolean = true, fill: Spacer = Spacer.DASH) => {
  if (dashed) {
    console.log(darkGrey(fill.repeat(process.stdout.columns ?? 80)));
  } else {
    console.log('');
  }
};

/**
 * Randomly determine if the character should be angry.
 * @returns {boolean}
 */
export function shouldAngry(): boolean {
  return Math.random() < 0.2;
}

/**
 * Randomly determine if the character should be tired.
 * @returns {boolean}
 */
export function shouldTired(): boolean {
  return Math.random() < 0.1;
}
