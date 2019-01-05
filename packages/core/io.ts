import { Plugin, IIOPlugin } from './plugin';
import { ComposerLogger } from './logger';
import { PluginType } from './constants';

// noinspection JSUnusedGlobalSymbols
export class IO extends Plugin implements Partial<IIOPlugin> {
  protected constructor(name: string, log?: ComposerLogger) {
    super(PluginType.io, name, log);
  }
}
