import Bluebird from 'bluebird';
import { Config, PluginConfig } from '../config';
import { ComposerLogger, loggerFactory } from '../logger';
import { IResult } from './result';

export enum PluginType {
  read = 'read',
  write = 'write',
  transform = 'transform',
  pipeline = 'pipeline'
}

export interface PluginConstructorParams {
  log?: ComposerLogger;
}

export interface Plugin {
  type: PluginType;
  name: string;
  log: ComposerLogger;
  [Symbol.toStringTag]: string;
}

export class Plugin implements Partial<Plugin> {
  type: PluginType;
  name: string;
  log: ComposerLogger;
  [Symbol.toStringTag]: string;
  protected constructor(type: PluginType, name: string, log?: ComposerLogger) {
    this.type = type;
    this.name = name;
    this.log = loggerFactory({
      name,
      type,
      log
    });
    this[Symbol.toStringTag] = `Plugin<${type}>`;
  }
  protected logStart(): void {
    this.log.debug(`${this.type} plugin start`);
  }
  protected logComplete(): void {
    this.log.debug(`${this.type} plugin complete`);
  }
  protected logError(err: Error): void {
    this.log.error({err}, `${this.type} plugin error`);
  }
  protected handleOperationLogging(promise: Bluebird<any>): Bluebird<any> {
    return promise.tap(() => {
      this.logComplete();
    }).catch(err => this.logError(err));
  }
}

export interface ReadPlugin extends Plugin {
  read(options: PluginConfig['options']): Bluebird<IResult>;
}

export class CoreReaderPlugin extends Plugin implements Partial<ReadPlugin> {
  protected constructor(name: string, log?: ComposerLogger) {
    super(PluginType.read, name, log);
  }
}

export interface WritePlugin extends Plugin {
  write(input: IResult, options: PluginConfig['options']): Bluebird<void>;
}

export class CoreWriterPlugin extends Plugin implements Partial<WritePlugin> {
  protected constructor(name: string, log?: ComposerLogger) {
    super(PluginType.write, name, log);
  }
}

export interface TransformPlugin extends Plugin {
  transform(input: IResult, options?: PluginConfig['options']): Bluebird<IResult>;
}

export class CoreTransformPlugin extends Plugin implements Partial<TransformPlugin> {
  protected constructor(name: string, log?: ComposerLogger) {
    super(PluginType.transform, name, log);
  }
}

export interface PipelinePlugin extends Plugin {
  operate(input: Config): Bluebird<Config>;
}

export class CorePipelinePlugin extends Plugin implements Partial<PipelinePlugin> {
  protected constructor(name: string, log?: ComposerLogger) {
    super(PluginType.pipeline, name, log);
  }
}
