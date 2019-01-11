import Bluebird from 'bluebird';
import { cloneDeep } from 'lodash';
import {
  CorePipelinePlugin,
  ComposerLogger,
  PluginRegistry,
  PipelinePlugin,
  Config,
  ImplementsPluginStaticFactory,
  PluginConstructorParams,
  MissingPluginError
} from '../../..';
import { name } from '../../../package.json';

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<AliasPlugin>()
export default class AliasPlugin extends CorePipelinePlugin implements PipelinePlugin {
  protected constructor(log?: ComposerLogger) {
    super('AliasPlugin', log);
    PluginRegistry.registerPipelinePlugin(`${name}/lib/plugins/alias`, this);
  }
  private static GetAllPluginsFromConfig(config: Config): string[] {
    if (!config.global || !config.global.aliases) {
      return [];
    }
    let inOutTransformPlugins = config.getUniquePluginPaths().filter(path => {
      if (!config.global || !config.global.aliases) {
        return true;
      }
      return config.global.aliases[path] === undefined;
    });
    return Object.keys(config.global.aliases).concat(inOutTransformPlugins);
  }
  private logAliasChange(alias: string, path: string, plugin: string): void {
    this.log.debug(`Alias (${alias}) at ${path} expanded to ${plugin}`);
  }
  // transform any plugin aliases into complete plugin paths
  async operate(input: Config): Bluebird<Config> {
    this.logStart();
    if (!input.global || !input.global.aliases) {
      this.log.debug('no aliases');
      this.logComplete();
      return input;
    }
    const plugins = AliasPlugin.GetAllPluginsFromConfig(input);
    this.log.trace({plugins}, 'loading all registered plugin paths');
    const pluginLength = plugins.length;
    for (let i=0; i < pluginLength; i++) {
      const plugin = plugins[i];
      if (plugins.indexOf(plugin) === -1) {
        const err = MissingPluginError.Factory({pluginPath: plugin});
        this.logError(err);
        throw err;
      }
      const alias = input.global.aliases[plugin];
      if (!alias) {
        continue;
      }
      // global
      if (input.global.plugins) {
        if (input.global.plugins[alias]) {
          this.logAliasChange(alias, 'global.plugins', plugin);
          const cloned = cloneDeep(input.global.plugins[alias]);
          delete input.global.plugins[alias];
          input.global.plugins[plugin] = cloned;
        }
      }
      if (input.global.pipelinePlugins) {
        const index = input.global.pipelinePlugins.indexOf(alias);
        if (index > -1) {
          this.logAliasChange(alias, 'pipelinePlugins', plugin);
          input.global.pipelinePlugins.splice(index, 1, plugin);
        }
      }
      // pipeline
      const pipelineLength = input.pipeline.length;
      for (let p=0; p < pipelineLength; p++) {
        const operation = input.pipeline[p];
        if (operation.in.plugin === alias) {
          this.logAliasChange(alias, 'operation.in.plugin', plugin);
          operation.in.plugin = plugin;
        }
        if (operation.out.plugin === alias) {
          this.logAliasChange(alias, 'operation.out.plugin', plugin);
          operation.out.plugin = plugin;
        }
        if (operation.transform) {
          operation.transform = operation.transform.map((transform, i) => {
            if (transform.plugin === alias) {
              this.logAliasChange(alias, `pipeline.$${i}.plugin`, plugin);
              transform.plugin = plugin;
            }
            return transform;
          });
        }
      }
    }
    this.logComplete();
    return input;
  }
  static Factory({log}: PluginConstructorParams): AliasPlugin {
    return new AliasPlugin(log);
  }
}
