import Bluebird from 'Bluebird';
import { readFile, outputFile, WriteFileOptions, ReadOptions } from 'fs-extra';
import { extname } from 'path';
import pkg from './package.json';
import {
  IO,
  IIOPlugin,
  ComposerLogger,
  IResult,
  ResultFactory,
  PluginRegistry,
  PluginConstructorParams,
  ImplementsPluginStaticFactory
} from '@composerjs/core';

type FSReadOptions = {
  uri: string;
} & ReadOptions;

type FSWriteOptions = {
  uri: string;
} & WriteFileOptions;

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<FS>()
export default class FS extends IO implements IIOPlugin {
  protected constructor(log?: ComposerLogger) {
    super('FS', log);
    PluginRegistry.registerIOPlugin(pkg.name, this, this.log);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({
    log
  }: PluginConstructorParams): FS {
    return new FS(log);
  }
  private static outputFile(uri: string, data: any, options: WriteFileOptions): Bluebird<void> {
    return Bluebird.resolve(outputFile(uri, data, options));
  }
  private static readFile(uri: string, options: ReadOptions): Bluebird<string> {
    return Bluebird.resolve(readFile(uri, options));
  }
  // noinspection JSUnusedGlobalSymbols
  async read({
    uri,
    encoding,
    flag
  }: FSReadOptions): Bluebird<IResult> {
    const content: string = await this.asyncLogger(FS.readFile(uri, {
      encoding,
      flag
    }));
    const tag = extname(uri);
    return ResultFactory({
      tag,
      content
    });
  }
  // noinspection JSUnusedGlobalSymbols
  async write(input: IResult, {
    uri,
    encoding,
    flag,
    mode
  }: FSWriteOptions): Bluebird<void> {
    await this.asyncLogger(FS.outputFile(uri, input.content, {
      encoding,
      flag,
      mode
    }));
  }
}
