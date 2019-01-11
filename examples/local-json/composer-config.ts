
export const config = {
  global: {
    aliases: {
      '@composerjs/plugin-transform-json5': 'json5',
      '@composerjs/plugin-transform-confidence': 'confidence'
    }
  },
  pipeline: [
    {
      in: {
        plugin: 'core/fs/read',
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
        plugin: 'core/fs/write',
        options: {
          path: './out/build.json'
        }
      }
    }
  ]
};
