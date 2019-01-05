import { Plugin, ITransformPlugin } from './plugin';
import { ComposerLogger } from './logger';
import { PluginType } from './constants';

// noinspection JSUnusedGlobalSymbols
export class Transform extends Plugin implements Partial<ITransformPlugin> {
  protected constructor(name: string, log?: ComposerLogger) {
    super(PluginType.transform, name, log);
  }
}
