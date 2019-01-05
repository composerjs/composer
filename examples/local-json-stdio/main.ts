import { Composer } from '@composerjs/composer';
import { Config } from '@composerjs/core';
import { config } from './composer-config';

async function main() {
  const composerConfig = Config.Factory(config);
  await Composer.Factory(composerConfig).compose();
}

main().catch(console.error);
