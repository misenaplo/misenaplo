var webpack = require("webpack");
module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jquery: 'jquery',
                'window.jQuery': 'jquery',
                jQuery: 'jquery'
            })
        ]
    }
}
