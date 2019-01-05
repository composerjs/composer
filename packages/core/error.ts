import { StaticImplements } from './factory';

const BASE_ERROR_NAME = 'ComposerError';

type ComposerErrorFactoryParams = {
  message: string;
  name: string;
}

export interface ComposerErrorConstructor {
  Factory(params: ComposerErrorFactoryParams): ComposerError;
  [Symbol.toStringTag]: string;
  readonly prototype: ComposerError;
}

export interface ComposerError {
  [key: string]: string;
  name: string;
  message: string;
  stack: string;
  [Symbol.toStringTag]: string;
}

@StaticImplements<ComposerErrorConstructor>()
export class ComposerError {
  name: string;
  message: string;
  // @ts-ignore
  // noinspection JSUnusedGlobalSymbols
  stack: string;
  [Symbol.toStringTag]: string = BASE_ERROR_NAME;
  static [Symbol.toStringTag]: string = BASE_ERROR_NAME;
  protected constructor(message: string, name: string = BASE_ERROR_NAME) {
    this.message = message;
		this.name = name;
    Error.captureStackTrace(this, ComposerError);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({message, name}: ComposerErrorFactoryParams): ComposerError {
    return new ComposerError(message, name);
  }
}
