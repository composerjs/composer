import Bluebird from 'bluebird';
import aws from 'aws-sdk';
import pkg from './package.json';
import {
  GetObjectRequest,
  GetObjectOutput,
  PutObjectRequest,
  PutObjectOutput
} from 'aws-sdk/clients/s3';
import {
  IO,
  IIOPlugin,
  IResult,
  ResultFactory,
  ComposerLogger,
  PluginRegistry,
  PluginConstructorParams,
  ImplementsPluginStaticFactory
} from '@composerjs/core';

// noinspection JSUnusedGlobalSymbols
@ImplementsPluginStaticFactory<S3>()
export default class S3 extends IO implements IIOPlugin {
  private s3: aws.S3;
  protected constructor(log?: ComposerLogger) {
    super('S3Reader', log);
	  this.s3 = new aws.S3();
    PluginRegistry.registerIOPlugin(pkg.name, this, this.log);
  }
  private getObject(params: GetObjectRequest): Bluebird<GetObjectOutput> {
    // @ts-ignore
    return Bluebird.fromCallback<GetObjectOutput>(this.s3.getObject)(params);
  }
  private putObject(params: PutObjectRequest): Bluebird<PutObjectOutput> {
    // @ts-ignore
    return Bluebird.fromCallback<PutObjectOutput>(this.s3.putObject)(params);
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({
    log
  }: PluginConstructorParams): S3 {
    return new S3(log);
  }
  // noinspection JSUnusedGlobalSymbols
  async read(params: GetObjectRequest): Bluebird<IResult> {
		const content = await this.asyncLogger(this.getObject(params).then(result => result.Body));
    return ResultFactory({
      tag: 'S3Object',
      content
    });
  }
  // noinspection JSUnusedGlobalSymbols
  async write(input: IResult, params: PutObjectRequest): Bluebird<void> {
    const options = Object.assign(params, {
      Body: input.content
    });
    await this.asyncLogger(this.putObject(options));
  }
}

