import { column, inline } from './common.js';

export enum Color {
  BLACK = 16,
  BLUE = 12,
  DARK_BLUE = 4,
  DARK_GREEN = 66,
  DARK_GREY = 241,
  DARK_YELLOW = 94,
  CYAN = 14,
  GREY = 248,
  GREEN = 10,
  LIGHT_BLUE = 32,
  LIGHT_GREEN = 42,
  LIGHT_GREY = 253,
  ORANGE = 214,
  PINK = 211,
  PURPLE = 13,
  RED = 9,
  SKY_BLUE = 87,
  WHITE = 255,
  YELLOW = 11,
}

export type ColorCode = keyof typeof Color;
export const getColor = (code: ColorCode | number) => {
  return typeof code === 'string' ? Color[code] : code;
};

export const colorize = (text: string, color: ColorCode | number) => {
  return `\x1b[38;5;${getColor(color)}m${text}\x1b[0m`;
};

export const fill = (text: string, color: ColorCode | number) => {
  return `\x1b[48;5;${getColor(color)}m${text}\x1b[0m`;
};

export const black = (text: string) => colorize(text, 'BLACK');
export const blue = (text: string) => colorize(text, 'BLUE');
export const darkBlue = (text: string) => colorize(text, 'DARK_BLUE');
export const darkGreen = (text: string) => colorize(text, 'DARK_GREEN');
export const darkGrey = (text: string) => colorize(text, 'DARK_GREY');
export const darkYellow = (text: string) => colorize(text, 'DARK_YELLOW');
export const cyan = (text: string) => colorize(text, 'CYAN');
export const grey = (text: string) => colorize(text, 'GREY');
export const green = (text: string) => colorize(text, 'GREEN');
export const lightBlue = (text: string) => colorize(text, 'LIGHT_BLUE');
export const lightGreen = (text: string) => colorize(text, 'LIGHT_GREEN');
export const lightGrey = (text: string) => colorize(text, 'LIGHT_GREY');
export const orange = (text: string) => colorize(text, 'ORANGE');
export const pink = (text: string) => colorize(text, 'PINK');
export const purple = (text: string) => colorize(text, 'PURPLE');
export const red = (text: string) => colorize(text, 'RED');
export const skyBlue = (text: string) => colorize(text, 'SKY_BLUE');
export const white = (text: string) => colorize(text, 'WHITE');
export const yellow = (text: string) => colorize(text, 'YELLOW');

export function highlight(text: string) {
  text = text.replace(/^"/, '').replace(/"$/, '');

  const segments = text.split('&&').map((segment) => {
    const parts = segment
      .trim()
      .split(' ')
      .map((part, i) => {
        if (part.startsWith('-')) {
          return darkGrey(part);
        }

        if (i === 0) {
          return blue(part);
        } else if (i === 1) {
          return cyan(part);
        } else {
          return grey(part);
        }
      });

    return column(parts);
  });

  return inline([darkGrey('"'), segments.join(darkGrey(' && ')), darkGrey('"')]);
}
