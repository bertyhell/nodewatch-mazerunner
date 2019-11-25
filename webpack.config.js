const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	mode: "production", // "production" | "development" | "none"
	entry: {
		desktop: path.resolve(__dirname, "src/desktop.ts"),
		bangle: path.resolve(__dirname, "src/bangle.ts")
	},
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, "dist"),
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [ '.ts' ],
	},
	optimization: {
		minimizer: [new UglifyJsPlugin()],
	},
};
