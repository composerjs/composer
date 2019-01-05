import { ComposerError } from './error';
import { PluginType } from './constants';

export class InvalidOperationError extends ComposerError {
  constructor() {
    super(
      `Operation is missing a plugin. Check your config for a misspelled key or missing 'plugin' key.`,
      'InvalidOperationError'
    );
  }
}

export class InvalidPluginError extends ComposerError {
  constructor(pluginPath: string) {
    super(
      `Plugin at path ${pluginPath} is required to have a type of ${Object.values(PluginType).join(', or ')}.`,
      'InvalidPluginError'
    );
  }
}

export class PluginNotRegisteredError extends ComposerError {
  constructor(pluginPath: string) {
    super(
      `Plugin at path ${pluginPath} is not registered.`,
      'PluginNotRegisteredError'
    );
  }
}

export class MissingPluginError extends ComposerError {
  constructor(pluginPath: string) {
    super(
      `Plugin at ${pluginPath} is not installed`,
      'MissingPluginError'
    );
  }
}

export class MissingPluginDefaultExportError extends ComposerError {
  constructor(pluginPath: string) {
    super(
      `Plugin at path ${pluginPath} does not have a default export`,
      'MissingPluginDefaultExportError'
    );
  }
}
