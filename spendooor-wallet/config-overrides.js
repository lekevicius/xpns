/* config-overrides.js */
const webpack = require('webpack');
module.exports = function override(config, env) {
    config.resolve.fallback = {
        util: require.resolve('util/'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            // process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer'],
        }),
    );

    // config.module.rules = [
    //     {
    //         test: /\.(js)$/,
    //         exclude: /node_modules/,
    //         use: {
    //             loader: 'babel-loader'
    //         }
    //     }
    // ]

    return config;
}
