
export const config = {
	global: {
		buildOptions: {
			concurrency: 20,
		},
		plugins: {
			"@composerjs/plugin-io-s3": {
				alias: "s3",
				options: {
					bucket: "bucketName",
					config: {
						apiVersion: '2006-03-01',
						region: 'us-west-2'
					}
				},
			}
		}
	},
	pipeline: [
		{
			in: {
				plugin: '@composerjs/plugin-io-s3',
				options: {
					bucket: 'bucketName'
				},
				buildOptions: {
					concurrency: 20
				}
			},
			transform: [
				{
					plugin: '@composerjs/plugin-transform-json5',
					options: {
					},
					buildOptions: {
						concurrency: 20
					}
				},
				{
					plugin: '@composerjs/plugin-transform-confidence',
					options: {
					},
					buildOptions: {
						concurrency: 20
					}
				}
			],
			out: {
				plugin: '@composerjs/plugin-io-s3',
				options: {
					bucket: 'bucketName',
					config: {
						apiVersion: '2006-03-01',
						region: 'us-west-2'
					}
				},
				buildOptions: {
					concurrency: 20
				}
			}
		}
	]
};
