import Bluebird from 'bluebird';
import {
  Config,
  ComposerLogger,
  IPipelineConfig,
  IPluginConfig,
  IResult,
  loggerFactory,
  OperationType,
  PluginLoader
} from '@composerjs/core';
import { IOOperation, TransformOperation } from './operation';
import { IOperationResult } from './types';

Bluebird.config({
  cancellation: true
});

export class Pipeline {
  private readonly pipeline: IPipelineConfig[];
  private readonly log: ComposerLogger;
  private constructor(pipeline: IPipelineConfig[], log?: ComposerLogger) {
    this.pipeline = pipeline;
    this.log = loggerFactory({
      name: 'Pipeline',
      log
    });
    this.log.trace('initializing pipeline');
  }
  private async init(): Bluebird<void> {
    this.log.trace('initializing plugins');
    const plugins = Config.GetUniquePluginPaths(this.pipeline);
    this.log.trace(`${plugins.length} plugins initialized.`);
    await PluginLoader.LoadAll(plugins, this.log);
  }
  private async input(config: IPluginConfig): Bluebird<IResult> {
    this.log.trace('starting input operation');
    const type = OperationType.in;
    const operationResult: IOperationResult = await IOOperation.Factory({
      type,
      config,
      log: this.log
    }).execute();
    this.log.trace(`input operation finished in ${operationResult.delta} seconds.`);
    return operationResult.result;
  }
  private async transform(input: IResult, operations: IPluginConfig[] = []): Bluebird<IResult> {
    this.log.trace('starting transform operation');
    let aggregateDelta: number = 0;
    const type = OperationType.transform;
    const {log} = this;
    const result: IResult = await Bluebird.reduce(operations, async (
      result: IResult,
      config: IPluginConfig
    ): Bluebird<IResult> => {
      const operationResult = await TransformOperation.Factory({
        type,
        config,
        log
      }).execute(result);
      aggregateDelta += operationResult.delta;
      return operationResult.result;
    }, input);
    this.log.trace(`transform operation finished in ${aggregateDelta} seconds.`);
    return result;
  }
  private async output(input: IResult, config: IPluginConfig): Bluebird<void> {
    this.log.trace('starting output operation');
    const type = OperationType.out;
    const {log} = this;
    const operationResult: IOperationResult = await IOOperation.Factory({
      type,
      config,
      log
    }).execute(input);
    this.log.trace(`output operation finished in ${operationResult.delta} seconds.`);
  }
  async execute(): Bluebird<void> {
    this.log.trace('starting pipeline operations');
    await Bluebird
      .map(this.pipeline, async operation => {
        const readResult = await this.input(operation.in);
        const transformResult = await this.transform(readResult, operation.transform);
        return this.output(transformResult || readResult, operation.out);
      }, {
        concurrency: 20
      });
    this.log.trace('pipeline operations complete');
  }
  static async Factory(config: IPipelineConfig[], log?: ComposerLogger): Bluebird<Pipeline> {
    const pipeline = new Pipeline(config, log);
    await pipeline.init();
    return pipeline;
  }
}
