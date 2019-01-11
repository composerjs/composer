import fs from 'fs-extra';
import {
  CoreReaderPlugin,
  ComposerLogger,
  PluginRegistry,
  ReadPlugin,
  PluginConstructorParams,
  ImplementsPluginStaticFactory,
  IResult,
  ResultFactory,
  Bluebird
} from '../../..';
import { name } from '../../../package.json';

interface FSReaderOptions {
  path: string;
  readOptions?: {
    flag?: string;
		} | {
    encoding: string;
    flag?: string;
  }
}

@ImplementsPluginStaticFactory<FSReader>()
export default class FSReader extends CoreReaderPlugin implements ReadPlugin {
  protected constructor(log?: ComposerLogger) {
    super('CoreReaderPlugin', log);
    PluginRegistry.registerReadPlugin(`${name}/lib/plugins/fs_read`, this);
  }
  async read({path, readOptions={}}: FSReaderOptions): Bluebird<IResult> {
    this.logStart();
    this.log.trace({readOptions}, 'with settings');
    const result = await this.handleOperationLogging(
      // @ts-ignore
      Bluebird.resolve(fs.readFile(path, readOptions))
    );
    return ResultFactory({
      tag: 'fs',
      content: result
    });
  }
  static Factory({
    log
  }: PluginConstructorParams): FSReader {
    return new FSReader(log);
  }
}
