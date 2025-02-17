import { column, inline } from './common.js';

export const COLOR = {
  BLACK: 16,
  BLUE: 12,
  BLUE_DARK: 18,
  BLUE_LIGHT: 33,
  CYAN: 14,
  GREY: 145,
  GREY_DARK: 8,
  GREY_LIGHT: 253,
  GREEN: 10,
  GREEN_DARK: 66,
  GREEN_LIGHT: 42,
  ORANGE: 214,
  PINK: 205,
  PURPLE: 91,
  RED: 9,
  SKY_BLUE: 39,
  WHITE: 15,
  YELLOW: 11,
  YELLOW_DARK: 220,
  YELLOW_LIGHT: 228,
};

export type ColorCode = keyof typeof COLOR;
export const getColor = (code: ColorCode | number) => {
  return typeof code === 'string' ? COLOR[code] : code;
};

export const colorize = (text: string, color: ColorCode | number) => {
  return `\x1b[38;5;${getColor(color)}m${text}\x1b[0m`;
};

export const fill = (text: string, color: ColorCode | number) => {
  return `\x1b[48;5;${getColor(color)}m${text}\x1b[0m`;
};

export const black = (text: string) => colorize(text, 'BLACK');
export const blue = (text: string) => colorize(text, 'BLUE');
export const darkBlue = (text: string) => colorize(text, 'BLUE_DARK');
export const darkGreen = (text: string) => colorize(text, 'GREEN_DARK');
export const darkGrey = (text: string) => colorize(text, 'GREY_DARK');
export const darkYellow = (text: string) => colorize(text, 'YELLOW_DARK');
export const cyan = (text: string) => colorize(text, 'CYAN');
export const grey = (text: string) => colorize(text, 'GREY');
export const green = (text: string) => colorize(text, 'GREEN');
export const lightBlue = (text: string) => colorize(text, 'BLUE_LIGHT');
export const lightGreen = (text: string) => colorize(text, 'GREEN_LIGHT');
export const lightGrey = (text: string) => colorize(text, 'GREY_LIGHT');
export const orange = (text: string) => colorize(text, 'ORANGE');
export const pink = (text: string) => colorize(text, 'PINK');
export const purple = (text: string) => colorize(text, 'PURPLE');
export const red = (text: string) => colorize(text, 'RED');
export const skyBlue = (text: string) => colorize(text, 'SKY_BLUE');
export const white = (text: string) => colorize(text, 'WHITE');
export const yellow = (text: string) => colorize(text, 'YELLOW');

export function highlight(text: string) {
  const quoted = text.startsWith('"') && text.endsWith('"');
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

  return inline([quoted ? darkGrey('"') : '', segments.join(darkGrey(' && ')), quoted ? darkGrey('"') : '']);
}
