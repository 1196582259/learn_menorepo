import path from 'path'
import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import webpack from 'webpack'

import dotenv from 'dotenv'
console.log('-------------------------')
console.log('NODE_ENV:', process.env.NODE_ENV)
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`, // 指定加载的.env文件
})

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.resolve(__filename, '../')
export default (env, argv) => {
  console.log('-------------------------------------------')
  console.log('NODE_ENV:', env)
  console.log('-------------------------------------------')
  console.log('TEST_ENV:', process.env.TEST_ENV)
  return {
    mode: argv.mode === 'production' ? 'production' : 'development',
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      publicPath: argv.mode === 'production' ? './' : '/',
      clean: true,
    },
    devtool: 'eval-source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'assets'),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
      historyApiFallback: {
        index: '/', // 指定 index 文件路径
        disableDotRule: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false, // 不保留空格
              isCustomElement: (tag) => tag.startsWith('demo-'), // 自定义元素
            },
            // 禁用预加载
            preload: false,
          },
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.vue', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './assets/index.html',
        filename: 'index.html', // 输出的文件名
        inject: 'body', // 注入JS到body底部
      }),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      }),
    ],
  }
}
