
export const config = {
	// Parameters used in every pipeline operation
	global: {
		// Global options
		options: {
			root: '~/Projects/composer/packages'
		},
		buildOptions: {

		}
	},
	pipeline: [
		{
			in: {
				plugin: '@composerjs/plugin-io-fs',
				options: {
					uri: '**/*.json5',

				},
				buildOptions: {
					concurrency: 20
				}
			},
			transform: [
				{
					plugin: '@composerjs/plugin-transform-json5'
				},
				{
					plugin: '@composerjs/plugin-transform-confidence'
				}
			],
			out: {
				plugin: '@composerjs/plugin-io-fs',
				options: {
					uri: '**/*.json'
				}
			}
		}
	]
};
