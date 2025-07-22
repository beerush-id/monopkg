import process from 'node:process';
import { glob } from 'glob';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export type SearchOptions = {
  cwd?: string;
  ignore?: Array<string>;
};

export const DEF_IGNORES = ['.git/**', 'node_modules/**', 'dist/**'];

export function search(query: string, options?: SearchOptions) {
  const { cwd = process.cwd(), ignore = [...DEF_IGNORES] } = options ?? {};
  const files = glob.sync('**/*', { cwd, ignore, nodir: true, absolute: true });
  const result = [];

  for (const file of files) {
    try {
      const url = pathToFileURL(file);
      const content = readFileSync(url, 'utf8');
      if (content.includes(query)) {
        result.push({ file });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return result.reverse();
}
