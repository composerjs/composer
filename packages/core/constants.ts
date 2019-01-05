
export enum PluginType {
  io = 'io',
  transform = 'transform'
}

export enum OperationType {
  in = 'read',
  out = 'write',
  transform = 'transform'
}

// noinspection JSUnusedGlobalSymbols
export function pluginTypeFromOperationType(operationType: OperationType) {
  switch (operationType) {
    case OperationType.in: {
      return PluginType.io;
    }
    case OperationType.out: {
      return PluginType.io;
    }
    case OperationType.transform: {
      return PluginType.transform;
    }
  }
}
