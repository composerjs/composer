import { CoreOptions } from 'request';
import request from 'request-promise';
import {
  ComposerLogger,
  CoreReaderPlugin,
  ReadPlugin,
  ImplementsPluginStaticFactory,
  PluginConstructorParams,
  PluginRegistry,
  Bluebird,
  IResult,
  ResultFactory
} from '@composerjs/core';
import { name } from './package.json';

interface HTTPReadOptions {
  uri: string;
  requestOptions?: CoreOptions;
}

@ImplementsPluginStaticFactory<HTTPReader>()
export class HTTPReader extends CoreReaderPlugin implements ReadPlugin {
  protected constructor(log?: ComposerLogger) {
    super('HTTPReader', log);
    PluginRegistry.registerReadPlugin(name, this);
  }
  async read({uri, requestOptions}: HTTPReadOptions): Bluebird<IResult> {
    this.logStart();
    const result = await this.handleOperationLogging(
      Bluebird.resolve(request.get(uri, requestOptions))
    );
    return ResultFactory({
      tag: 'http-read',
      content: result
    });
  }
  static Factory({
    log
  }: PluginConstructorParams): HTTPReader {
    return new HTTPReader(log);
  }
}

