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
    log.error({
      err: instantiationError
    });
    throw err;
  }
  private static async Load(pluginPath: string, log: ComposerLogger): Bluebird<void> {
    const resolvedPath = path.join(process.cwd(), 'node_modules', pluginPath);
    log.trace(`loading plugin at path ${resolvedPath}`);
    const logSuccess = () => {
      log.debug(`plugin ${pluginPath} successfully loaded! initializing plugin.`);
    };
    let isLoaded = false;
    let plugin;
    try {
      plugin = await import(resolvedPath);
    }
    catch (err) {
      throw PluginImportError.Factory({pluginPath, err});
    }
    if ( !plugin ) {
      throw MissingPluginError.Factory({pluginPath});
    }
    logSuccess();
    if ( plugin.reader ) {
      log.trace('using plugins "reader" export');
      try {
        plugin.reader.Factory({log});
        isLoaded = true;
      }
      catch (err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    }
    if ( plugin.writer ) {
      log.trace('using plugins "writer" export');
      try {
        plugin.writer.Factory({log});
        isLoaded = true;
      }
      catch (err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    }
    if ( plugin.transform ) {
      log.trace('using plugins "transform" export');
      try {
        plugin.transform.Factory({log});
        isLoaded = true;
      }
      catch (err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    }
    if ( plugin.pipeline ) {
      log.trace('using plugins "pipeline" export');
      try {
        plugin.pipeline.Factory({log});
        isLoaded = true;
      }
      catch (err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    }
    if ( !isLoaded && !plugin.default ) {
      throw MissingPluginDefaultExportError.Factory({pluginPath});
    } else if (!isLoaded) {
      log.trace('using plugins "default" export');
      try {
        plugin.default.Factory({log});
      }
      catch (err) {
        this.handleInstantiationError(err, pluginPath, log);
      }
    }
  }

  static async LoadAll(pluginPaths: string[], log: ComposerLogger): Bluebird<void> {
    log.trace(`loading ${pluginPaths.length} plugins`);
    await Bluebird.all(pluginPaths.map(path => PluginLoader.Load(path, log)));
  }
}
