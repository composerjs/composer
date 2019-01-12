
export const config = {
  global: {
    aliases: {
      '@composerjs/plugin-io-fs': 'fs',
      '@composerjs/plugin-io-http': 'http',
      '@composerjs/plugin-transform-json5': 'json5',
    }
  },
  pipeline: [
    {
      in: {
        plugin: 'http',
        options: {
          uri: 'https://raw.githubusercontent.com/json5/json5/master/package.json5',
          requestOptions: {
            json: true
          }
        }
      },
      transform: [
        {
          plugin: 'json5',
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
