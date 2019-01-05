import { ComposerLogger } from './logger';
import { IIOPlugin, ITransformPlugin } from './plugin';
import { PluginNotRegisteredError } from './errors';

export class PluginRegistry {
  private static ioPlugins: {
    [index: string]: IIOPlugin
  } = {};
  private static transformPlugins: {
    [index: string]: ITransformPlugin
  } = {};
  protected constructor() {}
  static getIOPlugin(pluginPath: string, log: ComposerLogger): IIOPlugin {
    const plugin = PluginRegistry.ioPlugins[pluginPath];
    if (!plugin) {
      const err = new PluginNotRegisteredError(pluginPath);
      log.error({err});
      throw err;
    }
    return plugin;
  }
  static getTransformPlugin(pluginPath: string, log: ComposerLogger): ITransformPlugin {
    const plugin = PluginRegistry.transformPlugins[pluginPath];
    if (!plugin) {
      const err = new PluginNotRegisteredError(pluginPath);
      log.error({err});
      throw err;
    }
    return plugin;
  }
  static registerIOPlugin(
    pluginPath: string,
    plugin: IIOPlugin,
    log: ComposerLogger
  ): void {
    log.trace(`registering plugin at path ${pluginPath}`);
    PluginRegistry.ioPlugins[pluginPath] = plugin;
  }
  static registerTransformPlugin(
    pluginPath: string,
    plugin: ITransformPlugin,
    log: ComposerLogger
  ): void {
    log.trace(`registering plugin at path ${pluginPath}`);
    PluginRegistry.transformPlugins[pluginPath] = plugin;
  }
}
