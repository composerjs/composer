import Bluebird from 'bluebird';
import {
  ComposerLogger,
  Config,
  CorePipelinePlugin,
  ImplementsPluginStaticFactory,
  PipelinePlugin,
  PluginConstructorParams,
  PluginRegistry
} from '../../..';
import { name } from '../../../package.json';
import plugins from '../registry.json';

const BASE_CORE_PLUGIN_PATH = `${name}/lib/plugins`;

type PluginAliasMap = {
  [index: string]: string
};

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<CoreAliasPlugin>()
export default class CoreAliasPlugin extends CorePipelinePlugin implements PipelinePlugin {
  protected constructor(log?: ComposerLogger) {
    super('CoreAliasPlugin', log);
    PluginRegistry.registerPipelinePlugin(`${name}/lib/plugins/core-alias`, this);
  }
  private static Replacer(plugin: string) {
    if (plugin.indexOf('_') > -1) {
      return plugin.replace('_', '/');
    } else if (plugin.indexOf('-') > -1) {
      const index = plugin.indexOf('-');
      return plugin.slice(0, index)
        + plugin.charAt(index + 1).toUpperCase()
        + plugin.slice(index + 2);
    } else {
      return plugin;
    }
  }
  private static GetPluginAlias(plugin: string): string {
    return `core/${CoreAliasPlugin.Replacer(plugin)}`;
  }
  // extends or creates a global config to pre-define aliases for core plugins
  async operate(input: Config): Bluebird<Config> {
    this.logStart();
    const PluginAliasMap: PluginAliasMap = {};
    let pluginLength: number = plugins.length;
    for (let i=0; i < pluginLength; i++) {
      let plugin = plugins[i];
      PluginAliasMap[`${BASE_CORE_PLUGIN_PATH}/${plugin}`] = CoreAliasPlugin.GetPluginAlias(plugin);
    }
    if (!input.global) {
      input.global = {};
    }
    if (!input.global.aliases) {
      input.global.aliases = {};
    }
    this.log.trace('core plugins aliased');
    input.global.aliases = Object.assign(input.global.aliases, PluginAliasMap);
    this.logComplete();
    return input;
  }
  static Factory({log}: PluginConstructorParams): CoreAliasPlugin {
    return new CoreAliasPlugin(log);
  }
}
