import Bluebird from 'bluebird';
import path from 'path';
import { ComposerLogger } from './logger';
import { MissingPluginDefaultExportError, MissingPluginError } from './errors';

// noinspection JSUnusedGlobalSymbols
export class PluginLoader {
  protected constructor() {}
  private static async Load(pluginPath: string, log: ComposerLogger): Bluebird<void> {
    const resolvedPath = path.join(process.cwd(), 'node_modules', pluginPath);
    log.trace(`loading plugin at path ${resolvedPath}`);
    let plugin;
    try {
      plugin = await import(resolvedPath);
    } catch {
      const err = new MissingPluginError(pluginPath);
      log.error({err});
      throw err;
    }
    if (!plugin) {
      const err = new MissingPluginError(pluginPath);
      log.error({err});
      throw err;
    }
    if (!plugin.default) {
      const err = new MissingPluginDefaultExportError(pluginPath);
      log.error({err});
      throw err;
    }
    log.trace(`plugin ${pluginPath} successfully loaded! initializing plugin.`);
    try {
      new plugin.default(log);
    } catch(err) {

    }
  }
  static async LoadAll(pluginPaths: string[], log: ComposerLogger): Bluebird<void> {
    log.trace(`loading ${pluginPaths.length} plugins`);
    await Bluebird.all(pluginPaths.map(path => PluginLoader.Load(path, log)));
  }
}
