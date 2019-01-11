import { Composer } from '@composerjs/composer';
import { Config } from '@composerjs/core';
import { config } from './composer-config';

async function main() {
  await Composer.Factory({
    config: Config.Factory(config)
  }).compose();
}

main().catch(console.error);
