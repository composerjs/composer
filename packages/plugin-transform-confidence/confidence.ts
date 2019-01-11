import Confidence from 'confidence';
import {
  TransformPlugin,
  CoreTransformPlugin,
  ComposerLogger,
  PluginRegistry,
  PluginConstructorParams,
  ImplementsPluginStaticFactory,
  IResult,
  ResultFactory,
  Bluebird
} from '@composerjs/core';
import { name } from './package.json';

interface ConfidencePluginOptions {
  space?: number | string;
  criteria?: {
    [key: string]: string
  };
}

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<ConfidencePlugin>()
export default class ConfidencePlugin extends CoreTransformPlugin implements TransformPlugin {
  protected constructor(log?: ComposerLogger) {
    super('ConfidenceJSON', log);
    PluginRegistry.registerTransformPlugin(name, this);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({log}: PluginConstructorParams): ConfidencePlugin {
    return new ConfidencePlugin(log);
  }
  async transform(input: IResult, {space, criteria}: ConfidencePluginOptions = {}): Bluebird<IResult> {
    this.logStart();
    this.log.trace({
      space,
      criteria
    }, 'with settings');
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
        criteria
      }), null, space);
    } catch(err) {
      this.logError(err);
      throw err;
    }
    this.logComplete();
		return ResultFactory({
			tag: 'confidence-json',
			content: json
		});
  }
}
