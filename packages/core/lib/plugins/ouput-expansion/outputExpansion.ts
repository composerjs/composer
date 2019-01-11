import Bluebird from 'bluebird';
import path from 'path';
import {
  ComposerLogger,
  Config,
  CorePipelinePlugin,
  ImplementsPluginStaticFactory,
  PipelinePlugin,
  PluginConstructorParams,
  PluginRegistry
} from '../../..';
import { name } from '../../../package.json';

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<OutputExpansionPlugin>()
export default class OutputExpansionPlugin extends CorePipelinePlugin implements PipelinePlugin {
  protected constructor(log?: ComposerLogger) {
    super('OutputExpansionPlugin', log);
    PluginRegistry.registerPipelinePlugin(`${name}/lib/plugins/output-expansion`, this);
  }
  async operate(input: Config): Bluebird<Config> {
    this.logStart();
    input.pipeline = input.pipeline.map(operation => {
      const inOptions = operation.in.options || {};
      const outOptions = operation.out.options || {};
      const parsed = path.parse(inOptions.path || inOptions.uri);
      if (outOptions.path) {
        outOptions.path = `${outOptions.path}${parsed.name}${parsed.ext}`;
      } else if (outOptions.uri) {
        outOptions.uri = `${outOptions.uri}${parsed.name}${parsed.ext}`;
      }
      return operation;
    });
    this.logComplete();
    return input;
  }
  static Factory({log}: PluginConstructorParams): OutputExpansionPlugin {
    return new OutputExpansionPlugin(log);
  }
}
