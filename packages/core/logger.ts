import logger, { Logger, SerializerFn, stdSerializers } from 'pino';

export type ComposerLogger = Logger;
export const loggerFactory = ({
  name,
  type,
  log,
  level,
  serializers,
  prettyPrint
}: {
  name: string,
  type?: string,
  log?: ComposerLogger,
  level?: string,
  serializers?: {[ key: string ]: SerializerFn},
  prettyPrint?: boolean
}): ComposerLogger => {
  let config = {
    name: `${name}${type ? '<' + type + '>' : ''}`,
    serializers: Object.assign({
      serializers: {
        err: stdSerializers.err
      }
    }, serializers || {})
  };
  if (log) {
    return log.child(config);
  }
	return logger(Object.assign(config, {
		level,
		prettyPrint
	}));
};
