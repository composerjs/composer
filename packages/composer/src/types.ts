import Bluebird from 'bluebird';
import {
  ComposerLogger,
  IPluginConfig,
  IResult,
  OperationType
} from '@composerjs/core';

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
