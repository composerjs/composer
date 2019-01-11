import { PluginNotRegisteredError } from '../../lib';
import { ImplementsPrivateConstructor } from '../factory';
import { ComposerLogger } from '../logger';
import {
  ReadPlugin,
  WritePlugin,
  TransformPlugin,
  PipelinePlugin,
  PluginType
} from './plugin';

type Plugins = ReadPlugin | WritePlugin | TransformPlugin | PipelinePlugin;
type Registry<T extends Plugins> = {
  [index: string]: T
}

@ImplementsPrivateConstructor()
export class PluginRegistry {
  private static readers: Registry<ReadPlugin> = {};
  private static writers: Registry<WritePlugin> = {};
  private static transforms: Registry<TransformPlugin> = {};
  private static pipelines: Registry<PipelinePlugin> = {};
  private static getRegistryFromType<T extends Plugins>(type: PluginType): Registry<T> {
    switch(type) {
      case PluginType.read: {
        return <Registry<T>>PluginRegistry.readers;
      }
      case PluginType.write: {
        return <Registry<T>>PluginRegistry.writers;
      }
      case PluginType.transform: {
        return <Registry<T>>PluginRegistry.transforms;
      }
      case PluginType.pipeline: {
        return <Registry<T>>PluginRegistry.pipelines;
      }
      default: {
        throw new Error('Invalid Type');
      }
    }
  }
  private static getPlugin<T extends Plugins>(
    type: PluginType,
    pluginPath: string,
    log: ComposerLogger
  ): T {
    const registry = this.getRegistryFromType(type);
    const plugin = <T>registry[pluginPath];
    if (!plugin) {
      const err = PluginNotRegisteredError.Factory({pluginPath});
      log.error({err});
      throw err;
    }
    return plugin;
  }
  private static setPlugin(
    type: PluginType,
    pluginPath: string,
    plugin: Plugins
  ): void {
    plugin.log.debug(`registering plugin at path ${pluginPath}`);
    const registry: Registry<Plugins> = this.getRegistryFromType<Plugins>(type);
    registry[pluginPath] = plugin;
  }
  static getAllRegisteredPluginPaths(): string[] {
    return Object.keys(this.readers)
      .concat(Object.keys(this.writers))
      .concat(Object.keys(this.transforms))
      .concat(Object.keys(this.pipelines));
  }
  static getReadPlugin(
    pluginPath: string,
    log: ComposerLogger
  ): ReadPlugin {
    return this.getPlugin<ReadPlugin>(PluginType.read, pluginPath, log);
  }
  static registerReadPlugin(
    pkg: string,
    plugin: ReadPlugin
  ): void {
    this.setPlugin(PluginType.read, pkg, plugin);
  }
  static getWritePlugin(
    pluginPath: string,
    log: ComposerLogger
  ): WritePlugin {
    return this.getPlugin<WritePlugin>(PluginType.write, pluginPath, log);
  }
  static registerWritePlugin(
    pkg: string,
    plugin: WritePlugin
  ): void {
    this.setPlugin(PluginType.write, pkg, plugin);
  }
  static getTransformPlugin(
    pluginPath: string,
    log: ComposerLogger
  ): TransformPlugin {
    return this.getPlugin<TransformPlugin>(PluginType.transform, pluginPath, log);
  }
  static registerTransformPlugin(
    pkg: string,
    plugin: TransformPlugin
  ): void {
    this.setPlugin(PluginType.transform, pkg, plugin);
  }
  static getPipelinePlugin(
    pluginPath: string,
    log: ComposerLogger
  ): PipelinePlugin {
    return this.getPlugin<PipelinePlugin>(PluginType.pipeline, pluginPath, log);
  }
  static registerPipelinePlugin(
    pkg: string,
    plugin: PipelinePlugin
  ): void {
    this.setPlugin(PluginType.pipeline, pkg, plugin);
  }
}
