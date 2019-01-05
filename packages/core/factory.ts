import { PluginConstructorParams } from './plugin';

export interface IStaticFactory<IInstance, IFactoryParams> {
  Factory(params: IFactoryParams): IInstance;
}

export function StaticImplements<IFactoryParams>() {
  // @ts-ignore
  // noinspection JSUnusedLocalSymbols
  return (constructor: IFactoryParams) => {}
}

export function ImplementsStaticFactory<IInstance, IFactoryParams>() {
  return StaticImplements<IStaticFactory<IInstance, IFactoryParams>>();
}

export function ImplementsPluginStaticFactory<IInstance>() {
  return ImplementsStaticFactory<IInstance, PluginConstructorParams>();
}
