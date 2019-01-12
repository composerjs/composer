import crypto from 'crypto';
import {
  ComposerLogger,
  CoreTransformPlugin,
  ImplementsPluginStaticFactory,
  TransformPlugin,
  PluginConstructorParams,
  PluginRegistry,
  IResult,
  ResultFactory,
  Bluebird
} from '@composerjs/core';
import { name } from './package.json';

interface CryptoTransformOptions {
  algorithm: string;
  encoding: 'hex' | 'latin1' | 'base64';
  inputEncoding: 'utf8' | 'ascii' | 'latin1';
}

let CryptoTransformOptions: CryptoTransformOptions;
CryptoTransformOptions = {
  algorithm: 'sha256',
  encoding: 'hex',
  inputEncoding: 'utf8'
};

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<CryptoTransformPlugin>()
export default class CryptoTransformPlugin extends CoreTransformPlugin implements TransformPlugin {
  protected constructor(log?: ComposerLogger) {
    super('CryptoTransformPlugin', log);
    PluginRegistry.registerTransformPlugin(name, this);
  }
  async transform(
    input: IResult, {algorithm, encoding, inputEncoding} = CryptoTransformOptions): Bluebird<IResult> {
    this.logStart();
    let content = crypto.createHash(algorithm)
        .update(input.content, inputEncoding)
        .digest(encoding);
    this.logComplete();
    return ResultFactory({
      tag: `crypto-${algorithm}-${encoding}`,
      content
    });
  }
  static Factory({log}: PluginConstructorParams): CryptoTransformPlugin {
    return new CryptoTransformPlugin(log);
  }
}
