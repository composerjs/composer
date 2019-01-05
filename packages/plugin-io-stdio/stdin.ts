import { Writable } from 'stream';
import Bluebird from 'bluebird';
import pkg from './package.json';
import {
  IO,
  IIOPlugin,
  ComposerLogger,
  IResult,
  ResultFactory,
  PluginRegistry, IPluginConfig,
} from '@composerjs/core';

export default class StdIO extends IO implements IIOPlugin {
  constructor(log?: ComposerLogger) {
    super('StdIO', log);
    PluginRegistry.registerIOPlugin(pkg.name, this, this.log);
  }
  // @ts-ignore
  async read(options: IPluginConfig['options']): Bluebird<IResult> {
    return new Bluebird(resolve => {
      process.stdin.on('readable', () => {
        const result = ResultFactory({
          content: process.stdin.read().toString()
        });
        process.stdin.end(() => resolve(result));
      });
    });
  }
  async write(input: IResult): Bluebird<void> {
    return new Bluebird(resolve => {
      process.stdout.on('writable', () => {
        process.stdout.pipe(new Writable({
          write() {
            return input.content;
          }
        }));
        process.stdout.end(() => resolve());
      });
      resolve();
    });
	}
}
