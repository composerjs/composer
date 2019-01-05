import {uniq} from 'lodash';
import { InvalidOperationError } from './errors';
import { ImplementsStaticFactory } from './factory';

export interface ICacheConfig {
  algorithm?: string;
  ttl?: number;
}

export interface IBuildOptions {
  concurrency?: number;
  cache?: ICacheConfig;
}

export interface IPluginConfig {
  plugin: string;
  options?: {
    [index: string]: Exclude<any, Function>
  },
  buildOptions?: IBuildOptions
}

export interface IGlobalConfig {
  buildOptions?: IBuildOptions;
  plugins?: {
    [index: string]: IPluginConfig
  }
}

export interface IPipelineConfig {
  in: IPluginConfig;
  transform?: IPluginConfig[];
  out: IPluginConfig;
}

export interface IConfig {
  global?: IGlobalConfig;
  pipeline: IPipelineConfig[]
}

@ImplementsStaticFactory<Config, IConfig>()
export class Config implements IConfig {
  pipeline: IConfig['pipeline'];
  global?: IConfig['global'];
  protected constructor(
    pipeline: IConfig['pipeline'],
    global?: IConfig['global']
  ) {
    this.pipeline = pipeline;
    this.global = global;
  }
  static Factory({
    pipeline,
    global
  }: {
    pipeline: IConfig['pipeline']
    global?: IConfig['global'],
  }): Config {
    return new Config(pipeline, global);
  }
  // noinspection JSUnusedGlobalSymbols
  static FromJSON(json: string): IConfig {
    let config;
    try {
      config = JSON.parse(json);
    } catch(err) {
      throw new Error('Invalid Config JSON');
    }
    return Config.Factory(config);
  }
  static GetUniquePluginPaths(pipeline: IPipelineConfig[]): string[] {
    let plugins: string[] = [];
    for(let i=0; i < pipeline.length; i++) {
      const operation = pipeline[i];
      plugins.push(operation.in.plugin);
      plugins.push(operation.out.plugin);
      if (operation.transform) {
        plugins = plugins.concat(
          operation.transform.map((transform: IPluginConfig) => {
            if (!transform.plugin) {
              throw new InvalidOperationError();
            }
            return transform.plugin;
          })
        );
      }
    }
    return uniq(plugins);
  }
  // noinspection JSUnusedGlobalSymbols
  toJSON(): object {
    return Object.assign({}, {
      pipeline: this.pipeline,
      global: this.global
    });
  }
}
