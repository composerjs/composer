
export const config = {
  global: {
    aliases: {
      '@composerjs/plugin-io-fs': 'fs',
      '@composerjs/plugin-transform-json5': 'json5',
      '@composerjs/plugin-transform-confidence': 'confidence'
    }
  },
  pipeline: [
    {
      in: {
        plugin: 'fs',
        options: {
          path: './build.json5'
        }
      },
      transform: [
        {
          plugin: 'json5'
        },
        {
          plugin: 'confidence',
          options: {
            space: 2
          }
        }
      ],
      out: {
        plugin: 'fs',
        options: {
          path: './out/*.json'
        }
      }
    }
  ]
};
