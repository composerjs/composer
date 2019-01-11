import { CoreOptions } from 'request';
import request from 'request-promise';
import {
  ComposerLogger,
  CoreWriterPlugin,
  WritePlugin,
  ImplementsPluginStaticFactory,
  PluginConstructorParams,
  PluginRegistry,
  Bluebird,
  IResult,
} from '@composerjs/core';
import { name } from './package.json';

interface HTTPWriteOptions {
  uri: string;
  method: 'POST' | 'PUT' | 'PATCH';
  requestOptions?: CoreOptions;
}

@ImplementsPluginStaticFactory<HTTPWriter>()
export class HTTPWriter extends CoreWriterPlugin implements WritePlugin {
  protected constructor(log?: ComposerLogger) {
    super('HTTPWriter', log);
    PluginRegistry.registerWritePlugin(name, this);
  }
  async write(input: IResult, {uri, method = 'POST', requestOptions}: HTTPWriteOptions): Bluebird<void> {
    this.logStart();
    await this.handleOperationLogging(
      Bluebird.resolve(
        request(uri, Object.assign(requestOptions, {
          method,
          data: input.content
        }))
      )
    );
  }
  static Factory({
    log
  }: PluginConstructorParams): HTTPWriter {
    return new HTTPWriter(log);
  }
}

