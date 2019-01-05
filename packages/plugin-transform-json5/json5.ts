import Bluebird from 'bluebird';
import JSON5 from 'json5';
import pkg from './package.json';
import {
  ITransformPlugin,
  Transform,
  IResult,
  ResultFactory,
  ComposerLogger,
  PluginRegistry,
  PluginConstructorParams,
  ImplementsPluginStaticFactory, IPluginConfig
} from '@composerjs/core';

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<JSON5Compiler>()
export default class JSON5Compiler extends Transform implements ITransformPlugin {
  protected constructor(log?: ComposerLogger) {
    super('JSON5', log);
    PluginRegistry.registerTransformPlugin(pkg.name, this, this.log);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({log}: PluginConstructorParams): JSON5Compiler {
    return new JSON5Compiler(log);
  }
  async transform(input: IResult, options: IPluginConfig['options'] = {}): Bluebird<IResult> {
    this.logStart();
    let parsed;
    try {
      parsed = JSON5.parse(input.content);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    let json;
    try {
      json = JSON.stringify(parsed, null, options.space);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    this.logComplete();
    return ResultFactory({
      tag: 'json',
      content: json
    });
  }
}
