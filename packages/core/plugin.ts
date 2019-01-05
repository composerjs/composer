import Bluebird from 'bluebird';
import { PluginType } from './constants';
import { IResult } from './result';
import { IPluginConfig } from './config';
import { ComposerLogger, loggerFactory } from './logger';

export interface IPlugin {
  type: PluginType;
  name: string;
  log: ComposerLogger;
  [Symbol.toStringTag]: string;
}

export interface PluginConstructorParams {
  log?: ComposerLogger
}

export interface ITransformPlugin extends IPlugin {
  transform(input: IResult, options?: IPluginConfig['options']): Bluebird<IResult>;
}

export interface IIOPlugin extends IPlugin {
  read(options: IPluginConfig['options']): Bluebird<IResult>;
  write(input: IResult, options?: IPluginConfig['options']): Bluebird<void>;
}

export class Plugin implements IPlugin {
  readonly type: PluginType;
  readonly name: string;
  readonly log: ComposerLogger;
  readonly [Symbol.toStringTag]: string = 'Plugin';
  protected constructor(type: PluginType, name: string, log?: ComposerLogger) {
    this.type = type;
    this.name = name;
    this.log = loggerFactory({
      name,
      type,
      log
    });
  }
  protected logStart(): void {
    this.log.trace(`${this.type} start`);
  }
  protected logComplete(): void {
    this.log.trace(`${this.type} complete`);
  }
  protected logError(err: Error): void {
    this.log.error(`${this.type} error`, {
      err
    });
  }
  // noinspection JSUnusedGlobalSymbols
  protected asyncLogger(promise: Bluebird<any>): Bluebird<any> {
    this.logStart();
    // @ts-ignore
    return promise.tap(() => {
      this.logComplete();
    }).catch((err: Error) => this.logError(err));
  }
}
