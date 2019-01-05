import Bluebird from 'bluebird';
import {
  ComposerLogger,
  IIOPlugin,
  ITransformPlugin,
  IPluginConfig,
  PluginRegistry,
  InvalidPluginError,
  IResult,
  loggerFactory,
  OperationType,
  ImplementsStaticFactory
} from '@composerjs/core';

Bluebird.config({
  cancellation: true
});

export interface IOperation {
  op?: Bluebird<IOperationResult>;
  start: number;
  delta: number;
  log: ComposerLogger;
  config: IPluginConfig;
  type: OperationType;
  execute(input?: IResult): Bluebird<IOperationResult>;
  halt(): void;
}

export interface IOperationResult {
  result: IResult,
  delta: number
}

export interface IOperationFactoryParams {
  type: OperationType,
  config: IPluginConfig,
  log?: ComposerLogger
}

@ImplementsStaticFactory<OperationResult, IOperationResult>()
class OperationResult implements IOperationResult {
  result: IResult;
  delta: number;
  protected constructor(result: IResult, delta: number) {
    this.result = result;
    this.delta = delta;
  }
  static Factory({
    result,
    delta
  }: IOperationResult): OperationResult {
    return new OperationResult(result, delta);
  }
}

class Operation implements Partial<IOperation> {
  op?: Bluebird<IOperationResult>;
  start: number = Date.now();
  log: ComposerLogger;
  config: IPluginConfig;
  type: OperationType;
  protected constructor(type: OperationType, config: IPluginConfig, log?: ComposerLogger) {
    this.type = type;
    this.config = config;
    this.log = loggerFactory({
      name: 'Operation',
      type,
      log
    });
  }
  // noinspection JSUnusedGlobalSymbols
  get delta(): number {
    return Date.now() - this.start;
  }
  protected processHandler(promise: Bluebird<IResult>): Bluebird<IOperationResult> {
    return promise.then((result: IResult) => {
      this.op = undefined;
      const {delta} = this;
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

@ImplementsStaticFactory<IOOperation, IOperationFactoryParams>()
export class IOOperation extends Operation implements IOperation {
  plugin: IIOPlugin;
  protected constructor(type: OperationType, config: IPluginConfig, log: ComposerLogger) {
    super(type, config, log);
    this.plugin = PluginRegistry.getIOPlugin(config.plugin, log);
  }
  async execute(input?: IResult): Bluebird<IOperationResult> {
    if (this.type === OperationType.in) {
      // @ts-ignore
      return this.processHandler(this.plugin.read(this.config.options));
    } else if (this.type === OperationType.out && input) {
      // @ts-ignore
      return this.processHandler(this.plugin.write(input, this.config.options));
    } else {
      throw new InvalidPluginError(this.config.plugin);
    }
  }
  static Factory({
    type,
    config,
    log
  }: {
    type: OperationType,
    config: IPluginConfig,
    log: ComposerLogger
  }): IOOperation {
    return new IOOperation(type, config, log);
  }
}

@ImplementsStaticFactory<TransformOperation, IOperationFactoryParams>()
export class TransformOperation extends Operation implements IOperation {
  plugin: ITransformPlugin;
  protected constructor(type: OperationType, config: IPluginConfig, log: ComposerLogger) {
    super(type, config, log);
    this.plugin = PluginRegistry.getTransformPlugin(config.plugin, log);
  }
  async execute(input: IResult): Bluebird<IOperationResult> {
    return this.processHandler(this.plugin.transform(input, this.config.options));
  }
  static Factory({
    type,
    config,
    log
  }: {
    type: OperationType,
    config: IPluginConfig,
    log: ComposerLogger
  }): TransformOperation {
    return new TransformOperation(type, config, log);
  }
}
