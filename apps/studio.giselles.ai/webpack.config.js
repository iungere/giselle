const path = require("node:path");

module.exports = {
	module: {
		rules: [
			{
				test: /\.handlebars$/,
				loader: "handlebars-loader",
				options: {
					helperDirs: [path.join(__dirname, "src/helpers")],
				},
			},
		],
	},
	resolve: {
		extensions: [".js", ".ts", ".handlebars"],
	},
};
