import Bluebird from 'bluebird';
import path from 'path';
import { ImplementsPrivateConstructor } from '../factory';
import { ComposerLogger } from '../logger';
import {
  PluginImportError,
  MissingPluginDefaultExportError,
  MissingPluginError,
  PluginInstantiationError
} from '../../lib/errors';

@ImplementsPrivateConstructor()
export class PluginLoader {
  protected constructor() {}
  private static handleInstantiationError(err: Error, pluginPath: string, log: ComposerLogger) {
    const instantiationError = PluginInstantiationError.Factory({pluginPath, err});
    log.error(pluginPath, instantiationError);
    throw err;
  }
  private static async Load(pluginPath: string, log: ComposerLogger): Bluebird<void> {
    const resolvedPath = path.join(process.cwd(), 'node_modules', pluginPath);
    log.trace(`loading plugin at path ${resolvedPath}`);
    const logSuccess = () => {
      log.debug(`plugin ${pluginPath} successfully loaded! initializing plugin.`);
    };
    let plugin;
    try {
      plugin = await import(resolvedPath);
    } catch (err) {
      const error = PluginImportError.Factory({pluginPath, err});
      log.error({error});
      throw error;
    }
    if (!plugin) {
      const err = MissingPluginError.Factory({pluginPath});
      log.error({err});
      throw err;
    }
    logSuccess();
    if (plugin.reader) {
      try {
        plugin.reader.Factory({log});
      } catch(err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    } else if (plugin.writer) {
      try {
        plugin.writer.Factory({log});
      } catch(err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    } else if (plugin.transform) {
      try {
        plugin.transform.Factory({log});
      } catch(err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    } else if (plugin.pipeline) {
      try {
        plugin.pipeline.Factory({log});
      } catch(err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    } else if (!plugin.default) {
      const err = MissingPluginDefaultExportError.Factory({pluginPath});
      log.error({err});
      throw err;
    } else {
      try {
        plugin.default.Factory({log});
      } catch(err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    }
  }
  static async LoadAll(pluginPaths: string[], log: ComposerLogger): Bluebird<void> {
    log.trace(`loading ${pluginPaths.length} plugins`);
    await Bluebird.all(pluginPaths.map(path => PluginLoader.Load(path, log)));
  }
}