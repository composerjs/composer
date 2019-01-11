const BASE_ERROR_NAME = 'ComposerError';

export interface ComposerError {
  [key: string]: string;
  name: string;
  message: string;
  stack: string;
  [Symbol.toStringTag]: string;
}

export class ComposerError {
  name: string;
  message: string;
  // @ts-ignore
  stack: string;
  [Symbol.toStringTag]: string = BASE_ERROR_NAME;
  static [Symbol.toStringTag]: string = BASE_ERROR_NAME;
  protected constructor(message: string, name: string = BASE_ERROR_NAME) {
    this.message = message;
    this.name = name;
    Error.captureStackTrace(this, ComposerError);
  }
}
