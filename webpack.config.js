const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");      //将css以link的方式引入，否则就用style-loader
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

//动态添加入口
function getEntry(){
  let entry = {};
  const path = './src/assets/js/';
  glob.sync(`${path}*.js`).forEach(function(name){
    let start = name.indexOf(path) + path.length;
    let end = name.length - 3;
    let eArr = [];
    let n = name.slice(start,end);
    entry[n] = name;
  })
  console.log('entry', entry);
  return entry;
}
//读取src目录所有page入口
let getHtmlConfig = function(name,chunks){
  return {
    template:`./src/page/${name}.html`,
    filename:`pages/${name}.html`,
    inject:true,
    hash:false,
    chunks:[name]
  }
}

//配置页面
let entryObj = getEntry();

let htmlArray = [];
Object.keys(entryObj).forEach(function(element){
  htmlArray.push({
    _html:element,
    title:'',
    chunks:[element]
  })
})


module.exports={
  mode:"development",
  entry:entryObj,
  devtool:'cheap-module-eval-source-map',
  output:{
    filename:'js/[name].[hash:8].js',
    path:path.resolve(__dirname,'dist')
  },
  module:{
    rules:[
      {
        test:/\.js$/,
        use:{
          loader:'babel-loader',
          options:{
            presets:['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
          loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
          },
          {
          loader: "sass-loader" // 将 Sass 编译成 CSS
        }]
      },
    ]
  },
  plugins:[
    new CleanWebpackPlugin(),
    new CopyPlugin([
      {from:"public",to:"public"}
    ]),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[id].css"
    }),
  ]
}
//自动生成html模板
htmlArray.forEach(function(element){
  module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html,element.chunks)));
}) 
