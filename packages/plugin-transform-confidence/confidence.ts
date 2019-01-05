import Bluebird from 'bluebird';
import Confidence from 'confidence';
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
@ImplementsPluginStaticFactory<ConfidencePlugin>()
export default class ConfidencePlugin extends Transform implements ITransformPlugin {
  protected constructor(log?: ComposerLogger) {
    super('ConfidenceJSON', log);
    PluginRegistry.registerTransformPlugin(pkg.name, this, this.log);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({log}: PluginConstructorParams): ConfidencePlugin {
    return new ConfidencePlugin(log);
  }
  async transform(input: IResult, options: IPluginConfig['options'] = {}): Bluebird<IResult> {
    this.logStart();
    let parsed;
    try {
      parsed = JSON.parse(input.content);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    let store;
    try {
      store = new Confidence.Store(parsed);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    let json;
    try {
      json = JSON.stringify(store.get('/', {
        criteria: options.criteria
      }), null, options.space);
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
