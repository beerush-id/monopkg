import { Command } from 'commander';
import { configs, listAllPackages, listPackages, options, pm, textStyle } from './core.js';
import { spawn } from 'node:child_process';
import process from 'node:process';

const randomColor = (text: string, prefix?: string) => {
  const colorCode = Math.floor(Math.random() * 128) + 128; // Ensure light colors
  return `\x1b[38;5;${colorCode}m${prefix ?? ''}${text}\x1b[0m`;
};

export const runCmd = new Command()
  .configureHelp(configs)
  .command('run.md <scripts...>')
  .description('Run a script in packages')
  .option('-b, --before-run.md <scripts...>', 'Run scripts before the main script')
  .action(async (scripts) => {
    const { root, include, exclude } = options;
    const { beforeRun } = runCmd.opts();

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    const packageColors = targetPackages.map((pkg) => ({
      name: pkg.name,
      color: randomColor(pkg.path, '⚡'),
    }));

    const run = async (scripts: string[]) => {
      const promises = targetPackages.map((pkg) => {
        const subPromises = scripts.map((script) => {
          const args = [script];
          const cwd = pkg.path;
          const cmdName = [
            packageColors.find((p) => p.name === pkg.name)?.color,
            `${textStyle.grey('[')}${textStyle.green(script)}${textStyle.grey(']:')} `,
          ].join('');
          const cmdPrefix = `${cwd}[${script}]`;
          const linePrefix = textStyle.padding(cmdPrefix);
          const argText = [textStyle.cyan(pm), textStyle.yellow('run'), textStyle.green(args.join(' '))].join(' ');

          console.log(`${cmdName}${argText}`);

          return new Promise((resolve, reject) => {
            const result = spawn(pm, ['run', ...args], {
              cwd,
              stdio: ['inherit', 'pipe', 'pipe'],
            });

            result.on('close', (code) => {
              if (code === 0) {
                resolve('ok');
              } else {
                reject(new Error('Failed to run.md script.'));
              }
            });

            result.on('error', (error) => {
              reject(error);
            });

            result.stdout.on('data', (data) => {
              const lines = data
                .toString()
                .split('\n')
                .map((line: string, i: number) =>
                  line === '' ? '' : `${i === 0 ? '' : textStyle.grey(linePrefix + '  ↪ ')}${line}`
                );

              process.stdout.write(`${cmdName}${lines.join('\n')}`);
            });

            result.stderr.on('data', (data) => {
              const lines = data
                .toString()
                .split('\n')
                .map((line: string, i: number) =>
                  textStyle.cyan(line === '' ? '' : `${i === 0 ? '' : linePrefix + '  ↪ '}${line}`)
                );

              process.stderr.write(`${cmdName}${lines.join('\n')}`);
            });
          });
        });

        return Promise.all(subPromises);
      });

      return Promise.all(promises);
    };

    if (beforeRun?.length) {
      await run(beforeRun);
    }

    run(scripts);
  });
