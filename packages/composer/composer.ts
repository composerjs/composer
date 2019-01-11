import { ComposerLogger, Config, loggerFactory } from '@composerjs/core';
import { Pipeline } from './src/pipeline';

const CORE_PIPELINE_PLUGINS = [
  '@composerjs/core/lib/plugins/core-alias',
  '@composerjs/core/lib/plugins/alias',
  '@composerjs/core/lib/plugins/global',
  '@composerjs/core/lib/plugins/output-expansion'
];

// noinspection JSUnusedGlobalSymbols
export class Composer {
  private readonly config: Config;
  private readonly log: ComposerLogger;
  protected constructor(config: Config) {
    if (!config.global) {
      config.global = {};
    }
    if (!config.global.pipelinePlugins) {
      config.global.pipelinePlugins = CORE_PIPELINE_PLUGINS;
    } else {
      config.global.pipelinePlugins = CORE_PIPELINE_PLUGINS.concat(
        config.global.pipelinePlugins
      );
    }
    this.config = config;
    this.log = loggerFactory({
      name: 'Composer',
      // For now log everything. This will default to error (or silence) for most clients
      // the cli will handle setting the log level
      level: 'trace',
      serializers: {
        config: function({global, pipeline}) {
          return {
            global,
            pipeline
          };
        }
      }
    });
    this.log.trace('initializing composer');
  }
  async compose() {
    this.log.trace('starting composer');
    const pipeline = await Pipeline.Factory(this.config, this.log);
    try {
      await pipeline.execute();
    } catch(err) {
      this.log.error({err}, 'Error executing pipeline');
    }
    this.log.trace('composer complete');
  }
  // noinspection JSUnusedGlobalSymbols
  static FromJSON(json: string): Composer {
    const config = Config.FromJSON(json);
    return Composer.Factory({config});
  }
  static Factory({config}: {config: Config}): Composer {
    return new Composer(config);
  }
}
