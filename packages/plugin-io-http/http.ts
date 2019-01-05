import Bluebird from 'bluebird';
import request from 'request-promise';
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

export type HTTPReadOptions = {
  uri: string;
};

export type HTTPWriteOptions = {
  uri: string;
  method: 'POST' | 'PUT' | 'PATCH';
};

@ImplementsPluginStaticFactory<HTTP>()
export default class HTTP extends IO implements IIOPlugin {
  protected constructor(log?: ComposerLogger) {
    super('HTTP', log);
    PluginRegistry.registerIOPlugin(pkg.name, this, this.log);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({
    log
  }: PluginConstructorParams): HTTP {
    return new HTTP(log);
  }
  async read({uri}: HTTPReadOptions): Bluebird<IResult> {
      // @ts-ignore
    const content = await this.asyncLogger(request.get(uri));
      return ResultFactory({
        content
      });
  }
  async write(input: IResult, {uri, method}: HTTPWriteOptions): Bluebird<void> {
    // @ts-ignore
    await this.asyncLogger(request({
      uri,
      method,
      body: input
    }));
  }
}
