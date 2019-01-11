import {
  ComposerLogger,
  Config,
  PluginConfig,
  PluginRegistry,
  IResult,
  loggerFactory,
  ImplementsStaticFactory,
  ReadPlugin,
  WritePlugin,
  TransformPlugin,
  PipelinePlugin,
  Bluebird
} from '@composerjs/core';

Bluebird.config({
  cancellation: true
});

interface Operation<T> {
  op?: Bluebird<OperationResult<T>>;
  start: number;
  log: ComposerLogger;
  config?: PluginConfig;
  halt(): void;
}

interface OperationResult<T> {
  result: T,
  delta: number
}

export interface OperationFactoryParams {
  config?: PluginConfig,
  log?: ComposerLogger
}

@ImplementsStaticFactory<OperationResult<T>, OperationResult<T>>()
class OperationResult<T> implements OperationResult<T> {
  result: T;
  delta: number;
  protected constructor(delta: number, result: T) {
    this.delta = delta;
    this.result = result;
  }
  static Factory<I>({
    delta,
    result
  }: OperationResult<I>): OperationResult<I> {
    return new OperationResult<I>(delta, result);
  }
}

class Operation<T> implements Partial<Operation<T>> {
  op?: Bluebird<OperationResult<T>>;
  start: number = Date.now();
  log: ComposerLogger;
  config?: PluginConfig;
  protected constructor(config?: PluginConfig, log?: ComposerLogger) {
    this.config = config;
    this.log = loggerFactory({
      name: 'Operation',
      log
    });
  }
  // noinspection JSUnusedGlobalSymbols
  get delta(): number {
    return Date.now() - this.start;
  }
  protected processHandler(promise: Bluebird<T>): Bluebird<OperationResult<T>> {
    return promise.then(result => {
      this.op = undefined;
      const { delta } = this;
      return OperationResult.Factory({
        result,
        delta
      });
    });
  }
  // noinspection JSUnusedGlobalSymbols
  halt() {
    if (this.op) {
      this.op.cancel();
    }
  }
}

@ImplementsStaticFactory<ReadOperation, OperationFactoryParams>()
export class ReadOperation extends Operation<IResult> implements Operation<IResult> {
  plugin: ReadPlugin;
  protected constructor(config?: PluginConfig, log?: ComposerLogger) {
    super(config, log);
    if (!config) {
      throw new Error('configuration required');
    }
    this.plugin = PluginRegistry.getReadPlugin(config.plugin, this.log);
  }
  execute(): Bluebird<OperationResult<IResult>> {
    if (!this.config) {
      throw new Error('configuration required');
    }
    this.log.trace({plugin: this.config}, 'running read operation');
    return this.processHandler(this.plugin.read(this.config.options));
  }
  static Factory({
    config,
    log
  }: OperationFactoryParams): ReadOperation {
    return new ReadOperation(config, log);
  }
}

@ImplementsStaticFactory<WriteOperation, OperationFactoryParams>()
export class WriteOperation extends Operation<void> implements Operation<void> {
  plugin: WritePlugin;
  protected constructor(config?: PluginConfig, log?: ComposerLogger) {
    super(config, log);
    if (!config) {
      throw new Error('configuration required');
    }
    this.plugin = PluginRegistry.getWritePlugin(config.plugin, this.log);
  }
  execute(input: IResult) {
    if (!this.config) {
      throw new Error('configuration required');
    }
    this.log.trace({plugin: this.config}, 'running write operation');
    return this.processHandler(this.plugin.write(input, this.config.options));
  }
  static Factory({
    config,
    log
  }: OperationFactoryParams): WriteOperation {
    return new WriteOperation(config, log);
  }
}

@ImplementsStaticFactory<TransformOperation, OperationFactoryParams>()
export class TransformOperation extends Operation<IResult> implements Operation<IResult> {
  plugin: TransformPlugin;
  protected constructor(config?: PluginConfig, log?: ComposerLogger) {
    super(config, log);
    if (!config) {
      throw new Error('configuration required');
    }
    this.plugin = PluginRegistry.getTransformPlugin(config.plugin, this.log);
  }
  execute(input: IResult) {
    if (!this.config) {
      throw new Error('configuration required');
    }
    this.log.trace({plugin: this.config}, 'running transform operation');
    return this.processHandler(this.plugin.transform(input, this.config.options));
  }
  static Factory({
    config,
    log
  }: OperationFactoryParams): TransformOperation {
    return new TransformOperation(config, log);
  }
}

@ImplementsStaticFactory<PipelineOperation, OperationFactoryParams>()
export class PipelineOperation extends Operation<Config> implements Operation<Config> {
  plugin: PipelinePlugin;
  protected constructor(plugin: string, log?: ComposerLogger) {
    super(undefined, log);
    this.plugin = PluginRegistry.getPipelinePlugin(plugin, this.log);
  }
  execute(input: Config) {
    return this.processHandler(this.plugin.operate(input));
  }
  static Factory({
    plugin,
    log
  }: {
    plugin: string,
    log?: ComposerLogger
  }): PipelineOperation {
    return new PipelineOperation(plugin, log);
  }
}
