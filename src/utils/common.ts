import { join } from 'node:path';
import process from 'node:process';
import { COLOR, type ColorCode, darkGrey, getColor } from './color.js';

export enum Icon {
  BRAND = '▩',
  CHECKED = '▣',
  UNCHECKED = '▢',
}

export const icon = (text: string) => `${Icon.BRAND} ${text}`;

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

const INDENT_SPACES = 2;

// eslint-disable-next-line no-control-regex
const ANSI_OPEN = /\x1b\[[0-9;]*m/g;

export const clear = (text: string) => {
  return text.replace(ANSI_OPEN, '');
};

export const wrap = (text: string, width: number = process.stdout.columns) => {
  const lines = [];
  const texts = text.split(' ');
  const maxWidth = width;
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

  return lines;
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
  paddingLeft?: number;
  paddingLeftSpacer?: Spacer;
  padding?: number;
  paddingSpacer?: Spacer;
  paddingRight?: number;
  paddingRightSpacer?: Spacer;
  width?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
};

export enum TableSymbol {
  TOP_LEFT = '┌',
  TOP_RIGHT = '┐',
  BOTTOM_LEFT = '└',
  BOTTOM_RIGHT = '┘',
  HORIZONTAL = '─',
  VERTICAL = '│',
  CROSS = '┼',
  MID_LEFT = '├',
  MID_RIGHT = '┤',
  MID_TOP = '┬',
  MID_BOTTOM = '┴',
}

export enum TreeSign {
  BEGIN = '┌',
  MIDDLE = '├',
  END = '└',
  FILLED = '│',
  DASHED = '┊',
}

export enum Spacer {
  MUTE = '',
  SPACE = ' ',
  DASH = '─',
  DASHED = '┄',
  DOT = '.',
  BULLET = '•',
  RING = '◇',
  EXEC = '»',
  DONE = '✓',
  ERROR = '✗',
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
  public _lines: string[];

  public get length() {
    return clear(this._lines.join('')).length;
  }

  public get lines() {
    const { paddingLeft = 0, paddingLeftSpacer, paddingRight = 0, paddingRightSpacer } = this.style;

    let lines = [...this._lines];

    if (this.style.width) {
      lines = lines
        .map((line) => {
          return wrap(line, (this.style.width as number) - ((paddingLeft ?? 0) + (paddingRight ?? 0)));
        })
        .flat();
    }

    lines = lines.map((line) => {
      const lPad = paddingLeft > 0 ? paddingLeft : 0;
      const rPad = paddingRight > 0 ? paddingRight : 0;
      const lPref = (paddingLeftSpacer ?? Spacer.SPACE).repeat(lPad);
      const rPref = (paddingRightSpacer ?? Spacer.SPACE).repeat(rPad);

      const columns = [
        this.prefix,
        stylize(lPref, { color: COLOR.GREY_DARK }),
        stylize(line, this.style),
        stylize(rPref, { color: COLOR.GREY_DARK }),
        this.suffix,
      ];

      return columns.filter((c) => c).join('');
    });

    return lines;
  }

  constructor(
    text: string,
    public style: TextStyle = {}
  ) {
    this._lines = text.split('\n');

    const { padding, paddingLeft, paddingRight, paddingSpacer, paddingLeftSpacer, paddingRightSpacer } = this.style;

    if (typeof padding === 'number' && !isNaN(padding)) {
      this.style.paddingLeft = paddingLeft ?? padding;
      this.style.paddingRight = paddingRight ?? padding;
    }

    this.style.paddingLeftSpacer = paddingLeftSpacer ?? paddingSpacer ?? Spacer.SPACE;
    this.style.paddingRightSpacer = paddingRightSpacer ?? paddingSpacer ?? Spacer.SPACE;
  }

  public padding(leftAll: number, right?: number, spacer = Spacer.SPACE) {
    this.style.paddingLeft = leftAll;
    this.style.paddingRight = right ?? leftAll;
    this.style.paddingLeftSpacer = spacer ?? Spacer.SPACE;
    this.style.paddingRightSpacer = spacer ?? Spacer.SPACE;

    return this;
  }

  public left(width: number | string[], spacer = Spacer.SPACE) {
    return this.align(width, 'left', spacer);
  }

  public center(width: number | string[], spacer = Spacer.SPACE) {
    return this.align(width, 'center', spacer);
  }

  public right(width: number | string[], spacer = Spacer.SPACE) {
    return this.align(width, 'right', spacer);
  }

  public align(width: number | string[], align: 'left' | 'center' | 'right' = 'left', spacer = Spacer.SPACE) {
    const spaces = maxLength(width) - this.length;

    if (align === 'left') {
      this.style.paddingLeft = 0;
      this.style.paddingRight = spaces;
    } else if (align === 'center') {
      const space = Math.floor(spaces / 2);
      this.style.paddingLeft = space + (spaces % 2);
      this.style.paddingRight = space;
    } else {
      this.style.paddingLeft = spaces;
      this.style.paddingRight = 0;
    }

    this.style.paddingLeftSpacer = spacer ?? Spacer.SPACE;
    this.style.paddingRightSpacer = spacer ?? Spacer.SPACE;

    return this;
  }

  public indent(level = 0, spacer = Spacer.SPACE) {
    return this.padding(level * INDENT_SPACES, 0, spacer);
  }

  public wrap(width: number) {
    this.style.width = width;
    return this;
  }

  public beginTree(level = 0, color = COLOR.GREY_DARK, spacer = Spacer.DASH) {
    return this.tree(level, TreeSign.BEGIN, color, spacer);
  }

  public tree(level = 0, sign = TreeSign.MIDDLE, color = COLOR.GREY_DARK, spacer = Spacer.DASHED) {
    this.prefix = stylize((sign + spacer).padEnd(level * INDENT_SPACES + 2, spacer), { color: color }) + ' ';
    return this;
  }

  public lineTree(level = 0, color = COLOR.GREY_DARK, spacer = Spacer.SPACE) {
    return this.tree(level, TreeSign.FILLED, color, spacer);
  }

  public endTree(level = 0, fg = COLOR.GREY_DARK, spacer = Spacer.DASH) {
    return this.tree(level, TreeSign.END, fg, spacer);
  }

  public list(level = 0, fg = COLOR.GREY_DARK, spacer = Spacer.SPACE) {
    this.prefix = stylize(Spacer.BULLET.padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public bullet(level = 0, fg = COLOR.GREY_DARK, spacer = Spacer.SPACE) {
    this.prefix = stylize((Spacer.BULLET + spacer).padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public ring(level = 0, fg = COLOR.GREEN, spacer = Spacer.SPACE) {
    this.prefix = stylize((Spacer.RING + spacer).padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public exec(level = 0, fg = COLOR.GREEN, spacer = Spacer.SPACE) {
    this.prefix = stylize((Spacer.EXEC + spacer).padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public done(level = 0, fg = COLOR.GREEN, spacer = Spacer.SPACE) {
    this.prefix = stylize((Spacer.DONE + spacer).padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public error(level = 0, fg = COLOR.RED, spacer = Spacer.SPACE) {
    this.prefix = stylize((Spacer.ERROR + spacer).padStart(level * INDENT_SPACES, spacer) + ' ', { color: fg });
    return this;
  }

  public text() {
    return this.lines.join('\n');
  }

  public color(fg: number | ColorCode) {
    this.style.color = fg;
    return this;
  }

  public fill(bg: number | ColorCode) {
    this.style.fill = bg;
    return this;
  }

  public black() {
    this.style.color = COLOR.BLACK;
    return this;
  }

  public fillBlack() {
    this.style.fill = COLOR.BLACK;
    return this;
  }

  public white() {
    this.style.color = COLOR.WHITE;
    return this;
  }

  public fillWhite() {
    this.style.fill = COLOR.WHITE;
    return this;
  }

  public red() {
    this.style.color = COLOR.RED;
    return this;
  }

  public fillRed() {
    this.style.fill = COLOR.RED;
    return this;
  }

  public green() {
    this.style.color = COLOR.GREEN;
    return this;
  }

  public fillGreen() {
    this.style.fill = COLOR.GREEN;
    return this;
  }

  public blue() {
    this.style.color = COLOR.BLUE;
    return this;
  }

  public fillBlue() {
    this.style.fill = COLOR.BLUE;
    return this;
  }

  public grey() {
    this.style.color = COLOR.GREY;
    return this;
  }

  public fillGrey() {
    this.style.fill = COLOR.GREY;
    return this;
  }

  public yellow() {
    this.style.color = COLOR.YELLOW;
    return this;
  }

  public fillYellow() {
    this.style.fill = COLOR.YELLOW;
    return this;
  }

  public darkGrey() {
    this.style.color = COLOR.GREY_DARK;
    return this;
  }

  public fillDarkGrey() {
    this.style.fill = COLOR.GREY_DARK;
    return this;
  }

  public darkGreen() {
    this.style.color = COLOR.GREEN_DARK;
    return this;
  }

  public fillDarkGreen() {
    this.style.fill = COLOR.GREEN_DARK;
    return this;
  }

  public darkYellow() {
    this.style.color = COLOR.YELLOW_DARK;
    return this;
  }

  public fillDarkYellow() {
    this.style.fill = COLOR.YELLOW_DARK;
    return this;
  }

  public lightGrey() {
    this.style.color = COLOR.GREY_LIGHT;
    return this;
  }

  public fillLightGrey() {
    this.style.fill = COLOR.GREY_LIGHT;
    return this;
  }

  public cyan() {
    this.style.color = COLOR.CYAN;
    return this;
  }

  public fillCyan() {
    this.style.fill = COLOR.CYAN;
    return this;
  }

  public pink() {
    this.style.color = COLOR.PINK;
    return this;
  }

  public fillPink() {
    this.style.fill = COLOR.PINK;
    return this;
  }

  public purple() {
    this.style.color = COLOR.PURPLE;
    return this;
  }

  public fillPurple() {
    this.style.fill = COLOR.PURPLE;
    return this;
  }

  public orange() {
    this.style.color = COLOR.ORANGE;
    return this;
  }

  public fillOrange() {
    this.style.fill = COLOR.ORANGE;
    return this;
  }

  public skyBlue() {
    this.style.color = COLOR.SKY_BLUE;
    return this;
  }

  public fillSkyBlue() {
    this.style.fill = COLOR.SKY_BLUE;
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

  public print() {
    console.log(this.text());
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
 * @param {string | Text | Array<Text | string>} children
 * @param {string} separator
 * @returns {string}
 */
export const inline = (children: string | Text | Array<Text | string>, separator: string = Spacer.MUTE): string => {
  if (!Array.isArray(children)) {
    return inline([children]);
  }

  return children
    .map((child) => {
      return child instanceof Text ? child.text() : child;
    })
    .join(separator);
};

inline.print = (children: string | Text | Array<Text | string>, separator: string = Spacer.MUTE): void => {
  console.log(inline(children, separator));
};

/**
 * Convert an array of text into a single string using spaces as separator.
 * @param {string | Text | Array<Text | string>} children
 * @param {string} separator
 * @returns {string}
 */
export const column = (children: string | Text | Array<Text | string>, separator: string = Spacer.SPACE): string => {
  return inline(children, separator);
};

column.print = (children: string | Text | Array<Text | string>, separator: string = Spacer.SPACE): void => {
  console.log(column(children, separator));
};

/**
 * Convert an array of text into a single string using new lines as separator.
 * @param {string | Text | Array<string | Text>} children
 * @returns {string}
 */
export const section = (children: string | Text | Array<string | Text>): string => {
  return inline(children, '\n');
};

section.print = (children: string | Text | Array<string | Text>): void => {
  console.log(section(children));
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
 * Create a regular expression from a glob pattern.
 * @param {string} pattern
 * @returns {RegExp}
 */
export function glob(pattern: string): RegExp {
  const normalized = pattern.replace(/\\/g, '/').replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${normalized}$`);
}

/**
 * Randomly determine if the character should be angry.
 * @returns {boolean}
 */
export function shouldAngry(): boolean {
  return Math.random() < 0;
}

/**
 * Randomly determine if the character should be tired.
 * @returns {boolean}
 */
export function shouldTired(): boolean {
  return Math.random() < 0;
}
