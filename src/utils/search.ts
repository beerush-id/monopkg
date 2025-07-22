import process from 'node:process';
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { column, Icon, txt } from './common.js';
import { darkGrey, green, red } from './color.js';

export type SearchOptions = {
  cwd?: string;
  ignore?: Array<string>;
  content?: boolean;
};

export type SearchResult = {
  file: string;
  path: string;
  content?: string;
};

export const DEF_IGNORES = ['.git/**', 'node_modules/**', 'dist/**'];

export function search(query: string, options?: SearchOptions): SearchResult[] {
  const { cwd = process.cwd(), ignore = [...DEF_IGNORES], content: withContent } = options ?? {};
  const files = glob.sync('**/*', { cwd, ignore, nodir: true, absolute: true });
  const result = [];

  for (const file of files) {
    try {
      const path = file.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, '');
      const fileUrl = pathToFileURL(file);
      const content = readFileSync(fileUrl, 'utf8');

      if (content.includes(query)) {
        result.push(withContent ? { file, path, content } : { file, path });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return result.reverse();
}

export type ReplaceOptions = SearchOptions & {
  dry?: boolean;
  verbose?: boolean;
};

export function searchAndReplace(query: string, replace: string, options?: ReplaceOptions) {
  const files = search(query, { ...options, content: true });

  for (const file of files) {
    if (!options?.dry) {
      const fileUrl = pathToFileURL(file.file);
      const content = (file.content ?? '').replaceAll(query, replace);

      writeFileSync(fileUrl, content, 'utf8');
    }

    const lines = (file.content ?? '').split('\n').filter((l) => l.includes(query));

    column.print([
      txt(file.path).darkGrey().tree(),
      txt('->').darkGrey(),
      txt(`${lines.length}`).darkGreen(),
      txt('changes').darkGrey(),
    ]);

    if (options?.verbose) {
      for (const line of lines) {
        const columns = line.trim().split(query);
        const srcLine = columns
          .map((col, i) => {
            const isLast = i === columns.length - 1;
            return [darkGrey(col), isLast ? '' : red(query)].filter(Boolean).join('');
          })
          .join('');
        const outLine = columns
          .map((col, i) => {
            const isLast = i === columns.length - 1;
            return [darkGrey(col), isLast ? '' : green(replace)].filter(Boolean).join('');
          })
          .join('');

        column.print([txt(Icon.MINUS).red().tree(), srcLine]);
        column.print([txt(Icon.PLUS).green().tree(), outLine]);
      }
    }
  }
}
