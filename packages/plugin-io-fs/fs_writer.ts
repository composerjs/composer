// @ts-ignore
import fs, {WriteFileOptions} from 'fs-extra';
import {
  IResult,
  ComposerLogger,
  CoreWriterPlugin,
  ImplementsPluginStaticFactory,
  WritePlugin,
  PluginConstructorParams,
  PluginRegistry,
  Bluebird
} from '../core';
import { name } from './package.json';

interface FSWriterOptions {
  path: string;
  writeOptions: WriteFileOptions
}

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<FSWriter>()
export class FSWriter extends CoreWriterPlugin implements WritePlugin {
  protected constructor (log?: ComposerLogger) {
    super('CoreWriterPlugin', log);
    PluginRegistry.registerWritePlugin(name, this);
  }
  async write(input: IResult, {path, writeOptions}: FSWriterOptions): Bluebird<void> {
    this.logStart();
    this.log.debug({writeOptions}, 'with settings');
    await this.handleOperationLogging(
      Bluebird.resolve(
        fs.outputFile(path, input.content, writeOptions)
      )
    );
  }
  static Factory({
    log
  }: PluginConstructorParams): FSWriter {
    return new FSWriter(log);
  }
}
