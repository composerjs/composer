
export const config = {
  pipeline: [
    {
      in: {
        plugin: '@composerjs/plugin-io-fs',
        options: {
          uri: './build.json5'
        }
      },
      transform: [
        {
          plugin: '@composerjs/plugin-transform-json5'
        }
      ],
      out: {
        plugin: '@composerjs/plugin-io-stdio'
      }
    },
    {
      in: {
        plugin: '@composerjs/plugin-io-stdio'
      },
      transform: [
        {
          plugin: '@composerjs/plugin-transform-confidence',
          space: 2
        }
      ],
      out: {
        plugin: '@composerjs/plugin-io-fs',
        options: {
          uri: './out/build.json'
        }
      }
    }
  ]
};
