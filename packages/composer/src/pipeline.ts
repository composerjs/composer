import {
  Config,
  ComposerLogger,
  PluginConfig,
  IResult,
  loggerFactory,
  PluginLoader,
  Bluebird
} from '@composerjs/core';
import {
  ReadOperation,
  WriteOperation,
  TransformOperation,
  PipelineOperation
} from './operation';

Bluebird.config({
  cancellation: true
});

export class Pipeline {
  private readonly config: Config;
  private readonly log: ComposerLogger;
  private totalTime: number = 0;
  private constructor(config: Config, log?: ComposerLogger) {
    this.config = config;
    this.log = loggerFactory({
      name: 'Pipeline',
      log
    });
    this.log.trace('initializing pipeline');
  }
  private async input(config: PluginConfig): Bluebird<IResult> {
    this.log.trace('starting input operation');
    const {log} = this;
    const operationResult = await ReadOperation.Factory({
      config,
      log
    }).execute();
    this.log.trace(`input operation finished in ${operationResult.delta} seconds.`);
    this.totalTime += operationResult.delta;
    return operationResult.result;
  }
  private async transform(input: IResult, operations: PluginConfig[] = []): Bluebird<IResult> {
    this.log.trace('starting transform operation');
    let aggregateDelta: number = 0;
    const {log} = this;
    const result: IResult = await Bluebird.reduce(operations, async (
      result: IResult,
      config: PluginConfig
    ): Bluebird<IResult> => {
      const operationResult = await TransformOperation.Factory({
        config,
        log
      }).execute(result);
      aggregateDelta += operationResult.delta;
      return Bluebird.resolve(operationResult.result);
    }, input);
    this.log.trace(`transform operation finished in ${aggregateDelta} seconds.`);
    this.totalTime += aggregateDelta;
    return result;
  }
  private async output(input: IResult, config: PluginConfig): Bluebird<void> {
    this.log.trace('starting output operation');
    const {log} = this;
    const operationResult = await WriteOperation.Factory({
      config,
      log
    }).execute(input);
    this.log.trace(`output operation finished in ${operationResult.delta} seconds.`);
    this.totalTime += operationResult.delta;
  }
  private async pipeline(input: Config): Bluebird<Config> {
    this.log.debug({
      config: input
    }, 'starting pipeline plugin operation');
    if (!input.global || !input.global.pipelinePlugins) {
      return input;
    }
    let totalTime: number = 0;
    const {log} = this;
    await Bluebird.mapSeries(input.global.pipelinePlugins, async plugin => {
      const operationResult = await PipelineOperation.Factory({
        plugin,
        log
      }).execute(input);
      totalTime += operationResult.delta;
      input = operationResult.result;
    });
    this.log.trace(`pipeline plugin operation finished in ${totalTime} seconds.`);
    this.totalTime += totalTime;
    return Config.Factory({
      pipeline: input.pipeline,
      global: input.global
    });
  }
  async execute(): Bluebird<void> {
    const {log, config} = this;
    log.debug({config}, 'starting pipeline operations');
    log.trace('initializing pipeline plugins');
    const pipelinePluginPlugins = config.getUniquePipelinePluginPaths();
    await PluginLoader.LoadAll(pipelinePluginPlugins, log);
    log.trace(`initialized ${pipelinePluginPlugins.length} pipeline plugins`);
    const mutatedConfig = await this.pipeline(config);

    log.debug({config: mutatedConfig}, 'initializing read/write/transform plugins');
    const pipelinePlugins = mutatedConfig.getUniquePluginPaths();
    this.log.trace({paths: pipelinePlugins}, 'getting plugin paths');
    await PluginLoader.LoadAll(pipelinePlugins, log);
    log.trace(`initialized ${pipelinePlugins.length} read/write/transform plugins`);

    await Bluebird
      .map(config.pipeline, async operation => {
        const readResult = await this.input(operation.in);
        const transformResult = await this.transform(readResult, operation.transform);
        return this.output(transformResult || readResult, operation.out);
      }, {
        concurrency: 20
      });
    log.trace(`pipeline operations complete in ${this.totalTime} seconds.`);
  }
  static async Factory(config: Config, log?: ComposerLogger): Bluebird<Pipeline> {
    return new Pipeline(config, log);
  }
}
