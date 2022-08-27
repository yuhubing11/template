# afe-vscode-template README

vscode模版插件，快速生成你想要的模板文件

## Feature

快速生成一个文件夹，包含内置的或自定义的模板

## config
默认配置：

在文件夹区域选中src->pages，右键新建，选中afe-vscode-template

自定义配置：

在根目录创建template.json文件
````
{
    "allowCreatePath":"src/pages", // 允许创建的路径，只有包含这个路径的才允许创建
    "isCustomTemplate":false, //是否开始自定义模式
    "customTeplate":"template" // 自定义模式下的模板文件名，会自动将此模板文件下的所有内容都复制到你所创建的文件下
}v
````

