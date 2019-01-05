import { Composer } from '@composerjs/composer';
import { Config, IConfig } from '@composerjs/core';
import { config } from './min-composer-config';

async function main() {
  const composerConfig = Config.Factory(<IConfig>config);
  await Composer.Factory(composerConfig).compose();
}

main().catch(console.error);
