import JSON5 from 'json5';
import { name } from './package.json';
import {
  CoreTransformPlugin,
  TransformPlugin,
  IResult,
  ResultFactory,
  ComposerLogger,
  PluginRegistry,
  PluginConstructorParams,
  ImplementsPluginStaticFactory,
  Bluebird
} from '@composerjs/core';

interface JSON5Options {
  space?: number | string;
  reviver?: (key: any, value: any) => any;
}

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<JSON5Compiler>()
export default class JSON5Compiler extends CoreTransformPlugin implements TransformPlugin {
  protected constructor(log?: ComposerLogger) {
    super('JSON5', log);
    PluginRegistry.registerTransformPlugin(name, this);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({log}: PluginConstructorParams): JSON5Compiler {
    return new JSON5Compiler(log);
  }
  async transform(input: IResult, {space, reviver}: JSON5Options = {}): Bluebird<IResult> {
    this.logStart();
    this.log.trace({
      space,
      reviver
    }, 'with settings');
    let parsed;
    try {
      parsed = JSON5.parse(input.content, reviver);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    let json;
    try {
      json = JSON.stringify(parsed, null, space);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    this.logComplete();
    return ResultFactory({
      tag: 'json5-json',
      content: json
    });
  }
}
