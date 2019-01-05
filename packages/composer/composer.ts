import { ComposerLogger, Config, loggerFactory } from '@composerjs/core';
import { Pipeline } from './src/pipeline';

// noinspection JSUnusedGlobalSymbols
export class Composer {
  private readonly config: Config;
  private readonly log: ComposerLogger;
  protected constructor(config: Config) {
    this.config = config;
    this.log = loggerFactory({
      name: 'Composer',
      level: 'trace',
      prettyPrint: true
    });
    this.log.trace('initializing composer');
  }
  async compose() {
    this.log.trace('starting composer');
    const pipeline = await Pipeline.Factory(this.config.pipeline, this.log);
    await pipeline.execute();
    this.log.trace('composer complete');
  }
  static Factory(config: Config): Composer {
    return new Composer(config);
  }
}
