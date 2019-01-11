import {
  ImplementsStaticFactory,
  ImplementsStaticFactoryNullParams
} from '../src/factory';
import { PluginType } from '../src/plugin';
import { ComposerError } from '../src/error';

interface BasePluginError {
  pluginPath: string;
}

interface PluginWithForeignError extends BasePluginError {
  err: Error;
}

@ImplementsStaticFactory<PluginInstantiationError, PluginWithForeignError>()
export class PluginInstantiationError extends ComposerError {
  private constructor(pluginPath: string, err: Error) {
    super(
      `Plugin at ${pluginPath} had an exception at runtime construction. 
      It's Error was:
      
      ${err.message}
      
      `,
      'PluginInstantiationError'
    );
    // @ts-ignore
    this.stack = err.stack;
  }
  static Factory({
    pluginPath,
    err
  }: PluginWithForeignError): PluginInstantiationError {
    return new PluginInstantiationError(pluginPath, err);
  }
}

@ImplementsStaticFactoryNullParams<InvalidOperationError>()
export class InvalidOperationError extends ComposerError {
  private constructor() {
    super(
      `Operation is missing a plugin. Check your config for a misspelled key or missing 'plugin' key.`,
      'InvalidOperationError'
    );
  }
  static Factory(): InvalidOperationError {
    return new InvalidOperationError();
  }
}

@ImplementsStaticFactory<InvalidPluginError, BasePluginError>()
export class InvalidPluginError extends ComposerError {
  private constructor(pluginPath: string) {
    super(
      `Plugin at path ${pluginPath} is required to have a type of ${Object.values(PluginType).join(', or ')}.`,
      'InvalidPluginError'
    );
  }
  static Factory({pluginPath}: BasePluginError): InvalidPluginError {
    return new InvalidPluginError(pluginPath);
  }
}

@ImplementsStaticFactory<PluginNotRegisteredError, BasePluginError>()
export class PluginNotRegisteredError extends ComposerError {
  private constructor(pluginPath: string) {
    super(
      `Plugin at path ${pluginPath} is not registered.`,
      'PluginNotRegisteredError'
    );
  }
  static Factory({pluginPath}: BasePluginError): PluginNotRegisteredError {
    return new PluginNotRegisteredError(pluginPath);
  }
}

@ImplementsStaticFactory<MissingPluginError, BasePluginError>()
export class MissingPluginError extends ComposerError {
  private constructor(pluginPath: string) {
    super(
      `Plugin at ${pluginPath} is not installed`,
      'MissingPluginError'
    );
  }
  static Factory({pluginPath}: BasePluginError): MissingPluginError {
    return new MissingPluginError(pluginPath);
  }
}

@ImplementsStaticFactory<PluginImportError, PluginWithForeignError>()
export class PluginImportError extends ComposerError {
  private constructor(pluginPath: string, err: Error) {
    super(
      `Plugin at ${pluginPath} failed to import with error message: ${err.stack}`,
      'PluginImportError'
    );
  }
  static Factory({pluginPath, err}: PluginWithForeignError): PluginImportError {
    return new PluginImportError(pluginPath, err);
  }
}

@ImplementsStaticFactory<MissingPluginDefaultExportError, BasePluginError>()
export class MissingPluginDefaultExportError extends ComposerError {
  private constructor(pluginPath: string) {
    super(
      `Plugin at path ${pluginPath} does not have a default export`,
      'MissingPluginDefaultExportError'
    );
  }
  static Factory({pluginPath}: BasePluginError): MissingPluginDefaultExportError {
    return new MissingPluginDefaultExportError(pluginPath);
  }
}

interface InvalidConfigurationErrorParams {
  message: string
}

@ImplementsStaticFactory<InvalidConfigurationError, InvalidConfigurationErrorParams>()
export class InvalidConfigurationError extends ComposerError {
  private constructor(message: string) {
    super(
      `Supplied configuration is not valid. Message: ${message}`,
      'InvalidConfigurationError'
    );
  }
  static Factory({message}: InvalidConfigurationErrorParams): InvalidConfigurationError {
    return new InvalidConfigurationError(message);
  }
}
