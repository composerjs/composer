import crypto from 'crypto';
import Bluebird from 'bluebird';
import {
  ComposerLogger,
  CoreTransformPlugin,
  ImplementsPluginStaticFactory,
  TransformPlugin,
  PluginConstructorParams,
  PluginRegistry,
  IResult,
  ResultFactory
} from '../../..';
import { name } from '../../../package.json';

interface CryptoTransformOptions {
  algorithm: string;
  encoding: 'hex' | 'latin1' | 'base64';
  inputEncoding: 'utf8' | 'ascii' | 'latin1';
}

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<CryptoTransformPlugin>()
export default class CryptoTransformPlugin extends CoreTransformPlugin implements TransformPlugin {
  protected constructor(log?: ComposerLogger) {
    super('CryptoTransformPlugin', log);
    PluginRegistry.registerTransformPlugin(`${name}/lib/plugins/crypto`, this);
  }
  async transform(
    input: IResult,
    {
      algorithm='sha256',
      encoding='hex',
      inputEncoding='utf8'
    }: CryptoTransformOptions): Bluebird<IResult> {
    this.logStart();
    let result = crypto.createHash(algorithm).update(input.content, inputEncoding);
    this.logComplete();
    return ResultFactory({
      tag: `crypto-${algorithm}-${encoding}`,
      content: result.digest(encoding)
    });
  }
  static Factory({log}: PluginConstructorParams): CryptoTransformPlugin {
    return new CryptoTransformPlugin(log);
  }
}
