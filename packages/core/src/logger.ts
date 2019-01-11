import pino, { Logger, SerializerFn } from 'pino';

export type ComposerLogger = Logger;
export const loggerFactory = ({
  name,
  type,
  log,
  level,
  serializers,
}: {
  name: string,
  type?: string,
  log?: ComposerLogger,
  level?: string,
  serializers?: {[ key: string ]: SerializerFn}
}): ComposerLogger => {
  let config = {
    name: `${name}${type ? '<' + type + '>' : ''}`,
    serializers: serializers || {}
  };
  if (log) {
    return log.child(config);
  }
	return pino(Object.assign(config, {
    level
  }));
};
