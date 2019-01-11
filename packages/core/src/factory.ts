import { PluginConstructorParams } from './plugin';

export interface PrivateConstructor {}

export interface IStaticFactory<Constructor, FactoryObject> {
  Factory(params: FactoryObject): Constructor;
}

interface StaticFactoryNullParams<Constructor> {
  Factory(): Constructor;
}

export function StaticImplements<Constructor>() {
  // @ts-ignore
  // noinspection JSUnusedLocalSymbols
  return (constructor: Constructor) => {}
}

export function ImplementsPrivateConstructor() {
  // @ts-ignore
  // noinspection JSUnusedLocalSymbols
  return (constructor: PrivateConstructor) => {}
}

export function ImplementsStaticFactory<Constructor, FactoryObject>() {
  return StaticImplements<IStaticFactory<Constructor, FactoryObject>>();
}

export function ImplementsStaticFactoryNullParams<Constructor>() {
  return StaticImplements<StaticFactoryNullParams<Constructor>>();
}

export function ImplementsPluginStaticFactory<Constructor>() {
  return ImplementsStaticFactory<Constructor, PluginConstructorParams>();
}
