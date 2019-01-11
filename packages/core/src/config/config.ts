import { uniq } from 'lodash';
import Ajv from 'ajv';
import schema from './configSchema.json';
import { InvalidOperationError, InvalidConfigurationError } from '../../lib';
import { ImplementsStaticFactory } from '../factory';

export interface CacheConfig {
  algorithm?: string;
  ttl?: number;
}

export interface BuildOptions {
  concurrency?: number;
  cache?: CacheConfig;
}

export interface PluginConfig {
  plugin: string;
  options?: {
    [index: string]: any
  },
  buildOptions?: BuildOptions
}

export interface GlobalConfig {
  aliases?: {
    [index: string]: string
  },
  plugins?: {
    [index: string]: PluginConfig
  },
  pipelinePlugins?: string[]
}

export interface PipelineConfig {
  in: PluginConfig;
  transform?: PluginConfig[];
  out: PluginConfig;
}

export interface Config {
  global?: GlobalConfig;
  pipeline: PipelineConfig[]
}

@ImplementsStaticFactory<Config, Config>()
export class Config implements Config {
  pipeline: Config['pipeline'];
  global?: Config['global'];
  protected constructor(
    pipeline: Config['pipeline'],
    global?: Config['global']
  ) {
    this.pipeline = pipeline;
    this.global = global;
    this.validate();
  }
  static Factory({
    pipeline,
    global
  }: {
    pipeline: Config['pipeline']
    global?: Config['global'],
  }): Config {
    return new Config(pipeline, global);
  }
  // noinspection JSUnusedGlobalSymbols
  static FromJSON(json: string): Config {
    let config;
    try {
      config = JSON.parse(json);
    } catch(err) {
      throw new Error('Invalid Config JSON');
    }
    return Config.Factory(config);
  }
  getUniquePipelinePluginPaths(): string[] {
    if (!this.global || !this.global.pipelinePlugins) {
      return [];
    }
    return uniq(this.global.pipelinePlugins);
  }
  getUniquePluginPaths(): string[] {
    let plugins: string[] = [];
    for (let i=0; i < this.pipeline.length; i++) {
      const operation = this.pipeline[i];
      if (!operation.in.plugin) {
        throw InvalidOperationError.Factory();
      }
      plugins.push(operation.in.plugin);
      if (!operation.out.plugin) {
        throw InvalidOperationError.Factory();
      }
      plugins.push(operation.out.plugin);
      if (operation.transform) {
        plugins = plugins.concat(
          operation.transform.map((transform: PluginConfig) => {
            if (!transform.plugin) {
              throw InvalidOperationError.Factory();
            }
            return transform.plugin;
          })
        );
      }
    }
    return uniq(plugins);
  }
  private validate(): void {
    const ajv = new Ajv();
    const isValid = ajv.validate(schema, this.toJSON());
    if (!isValid) {
      let messages: string[] = [];
      if (ajv.errors) {
        ajv.errors.forEach(error => {
          messages.push(error.message || '');
        });
      }
      throw InvalidConfigurationError.Factory({message: messages.join('\n')});
    }
  }
  // noinspection JSUnusedGlobalSymbols
  toJSON(): object {
    return Object.assign({}, {
      pipeline: this.pipeline,
      global: this.global
    });
  }
}
