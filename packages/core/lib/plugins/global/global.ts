import Bluebird from 'bluebird';
import {
  CorePipelinePlugin,
  ComposerLogger,
  PluginRegistry,
  PipelinePlugin,
  Config,
  ImplementsPluginStaticFactory,
  PluginConstructorParams
} from '../../..';
import { name } from '../../../package.json'

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<GlobalPipelinePlugin>()
export default class GlobalPipelinePlugin extends CorePipelinePlugin implements PipelinePlugin {
  protected constructor(log?: ComposerLogger) {
    super('GlobalPipelinePlugin', log);
    PluginRegistry.registerPipelinePlugin(`${name}/lib/plugins/global`, this);
  }
  private logAssign(plugin: string, path: string, before: object, after: object) {
    this.log.trace(
      {
				before,
				after
      },
      `Plugin ${plugin} at path ${path} is being extended with global configuration`
    );
  }
  async operate(input: Config): Bluebird<Config> {
    if (!input.global || !input.global.plugins) {
      return input;
    }
    const pluginConfig = input.global.plugins;
    this.logStart();
    input.pipeline = input.pipeline.map((op, i) => {
      if (pluginConfig[op.in.plugin]) {
        if (!op.in.options) {
          op.in.options = {};
        }
        this.logAssign(
          op.in.plugin,
          `pipeline.${i}.in.options`,
          op.in.options,
          pluginConfig[op.in.plugin]
        );
        Object.assign(op.in.options, pluginConfig[op.in.plugin]);
      }
      if (pluginConfig[op.out.plugin]) {
        if (!op.out.options) {
          op.out.options = {};
        }
        this.logAssign(
          op.out.plugin,
          `pipeline.${i}.out.options`,
          op.out.options,
          pluginConfig[op.out.plugin]
        );
        Object.assign(op.out.options, pluginConfig[op.out.plugin]);
      }
      if (op.transform) {
        op.transform = op.transform.map((transform, ti) => {
          if (pluginConfig[transform.plugin]) {
            if (!transform.options) {
              transform.options = {};
            }
            this.logAssign(
              transform.plugin,
              `pipeline.${i}.transform.${ti}.options`,
              transform.options,
              pluginConfig[transform.plugin]
            );
            Object.assign(transform.options, pluginConfig[transform.plugin]);
          }
          return transform;
        });
      }
      return op;
    });
    return input;
  }
  static Factory({log}: PluginConstructorParams): GlobalPipelinePlugin {
    return new GlobalPipelinePlugin(log);
  }
}
