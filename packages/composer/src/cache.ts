import crypto from 'crypto';
import {
  ICacheConfig,
  IResult,
  ImplementsStaticFactory
} from '@composerjs/core';

const ONE_DAY = 1000 * 60 * 60 * 24;

function createHash(content: IResult, algorithm: string): string {
  return crypto.createHash(algorithm).update(JSON.stringify(content)).digest('hex');
}

export interface ICacheItem {
  id: string;
  content: IResult;
  hash: string;
  ttl: number;
  last_run: number;
}

export interface ICache {
  get(id: string): ICacheItem | undefined;
  add(id: string, content: IResult): void;
  validate(id: string, content: IResult): boolean;
}

const CacheItemFactory = ({
  id,
  content,
  algorithm,
  ttl
}: {
  id: string,
  content: IResult,
  algorithm: string,
  ttl: number
}): ICacheItem => ({
  id,
  content,
  ttl,
  hash: createHash(content, algorithm),
  last_run: Math.floor(Date.now() / 1000)
});

@ImplementsStaticFactory<Cache, ICacheConfig>()
export class Cache implements ICache {
  private readonly algorithm: string;
  private readonly ttl: number;
  private cache: {[index: string]: ICacheItem} = {};
  protected constructor(algorithm: string = 'md5', ttl: number = ONE_DAY) {
    this.algorithm = algorithm;
    this.ttl = ttl;
  }
  // noinspection JSUnusedGlobalSymbols
  static Factory({algorithm, ttl}: ICacheConfig = {}) {
    return new Cache(algorithm, ttl);
  }
  private static Compare(previous: string, next: string): boolean {
    return previous.localeCompare(next, undefined, {
      usage: 'search',
      sensitivity: 'variant'
    }) === 0;
  }
  get(id: string): ICacheItem | undefined {
    return this.cache[id];
  }
  add(id: string, content: IResult): void {
    const {algorithm, ttl} = this;
    this.cache[id] = CacheItemFactory({
      id,
      content,
      algorithm,
      ttl
    });
  }
  validate(previousId: string, content: IResult): boolean {
    const next = createHash(content, this.algorithm);
    const prev = this.get(previousId);
    if (!prev) {
      return false;
    }
    return Cache.Compare(prev.hash, next);
  }
}
