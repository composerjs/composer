import Bluebird from 'bluebird';
import path, { ParsedPath } from 'path';
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
  private static ParsePathExpression(inPath: ParsedPath, outPath: ParsedPath): string {
    if (outPath.name === '*') {
      return `${outPath.dir}/${inPath.name}${outPath.ext}`;
    } else {
      return `${outPath.dir}/${outPath.name}${outPath.ext}`;
    }
  }
  async operate(input: Config): Bluebird<Config> {
    this.logStart();
    input.pipeline = input.pipeline.map(operation => {
      const inOptions = operation.in.options || {};
      const outOptions = operation.out.options || {};
      const inParsed = path.parse(inOptions.path || inOptions.uri);
      const outParsed = path.parse(outOptions.path || outOptions.uri);
      if (outOptions.path) {
        outOptions.path = OutputExpansionPlugin.ParsePathExpression(
          inParsed,
          outParsed
        );
      } else if (outOptions.uri) {
        outOptions.uri = OutputExpansionPlugin.ParsePathExpression(
          inParsed,
          outParsed
        );
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
