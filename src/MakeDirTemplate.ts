import * as shell from 'shelljs';
import * as vscode from "vscode";
// import * as fs from 'fs';
import * as path from 'path';

const fs = require('fs')

import { vsWebView } from './constant';

// /** 主要版本 */
// let major = process.version.match(/v([0-9]*).([0-9]*)/)[1]
// /** 特性版本 */
// let minor = process.version.match(/v([0-9]*).([0-9]*)/)[2]

export class MakeDirTemplate {
  config: any;
  url: any;
  panel!: vscode.WebviewPanel;
  webView!: vscode.Webview;
  tag: string;
  rootPath: string;
  isJudge: boolean;
  json
  constructor(config: any, url: any, tag: string, json: any) {
    this.config = config;
    this.url = url;
    this.tag = tag;
    this.rootPath = '';
    this.isJudge = false;
    this.json = json;
    // this.readDir(url.path.replace(/\\/g,'/').replace('/',''))
    this.init();

  }
  init() {
    if (!this.checkPosition()) {
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'testWebview', // viewType
      "请填写目录名", // 视图标题
      vscode.ViewColumn.One, // 显示在编辑器的哪个部位
      {
        enableScripts: true, // 启用JS，默认禁用
        retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
      }
    );
    this.webView = this.panel.webview;
    this.loadHtml();
    this.addListener();

  }

  checkPosition() {
    if (Object.keys(this.json).length > 0) {
      if (!this.url.path.includes(`${this.json.allowCreatePath && this.json.allowCreatePath || 'src/pages'}`)) {
        vscode.window.showErrorMessage(`鼠标必须选中${this.json.allowCreatePath && this.json.allowCreatePath || 'src/pages'}`);
        return false;
      }
    } else {
      if (!this.url.path.includes("src/pages")) {
        vscode.window.showErrorMessage("鼠标必须选中src/pages");
        return false;
      }
    }

    return true;
  }
  loadHtml() {


    if (this.webView) {
      this.webView.html = vsWebView;
    }

  }
  cpSync(source: any, destination: any) {
    // 判断node版本不是16.7.0以上的版本
    // 则进入兼容处理
    // 这样处理是因为16.7.0的版本支持了直接复制文件夹的操作
    // if (Number(major) < 16 || Number(major) == 16 && Number(minor) < 7) {
      // 如果存在文件夹 先递归删除该文件夹
      if (fs.existsSync(destination)) fs.rmSync(destination, { recursive: true })
      // 新建文件夹 递归新建
      fs.mkdirSync(destination, { recursive: true });
      // 读取源文件夹
      let rd = fs.readdirSync(source)
      for (const fd of rd) {
        // 循环拼接源文件夹/文件全名称
        let sourceFullName = source + "/" + fd;
        // 循环拼接目标文件夹/文件全名称
        let destFullName = destination + "/" + fd;
        // 读取文件信息
        let lstatRes = fs.lstatSync(sourceFullName)
        // 是否是文件
        if (lstatRes.isFile()) fs.copyFileSync(sourceFullName, destFullName);
        // 是否是文件夹
        if (lstatRes.isDirectory()) this.cpSync(sourceFullName, destFullName);
      }
    // }
    // else fs.cpSync(source, destination, { force: true, recursive: true })
  }
  addListener() {
    if (!this.panel) {
      return;
    }
    this.panel.webview.onDidReceiveMessage(message => { // 插件接收信息
      switch (message.code) {
        case 0:
          const { dirName } = message.data;
          this.createTemp(dirName);
          this.panel.dispose();
          return;
        case -1:
          vscode.window.showErrorMessage("cancel");
          this.panel.dispose();
          return;
      }
    }, null, this.config.subscriptions);

    this.panel.onDidDispose(() => {
      this.panel.dispose();
    }, null, this.config.subscriptions);
  }
  async createTemp(dirName: string) {
    //创建模板目录所在父目录
    const workDir = await this.getCurDir();
    //模板所在目录
    var tempDir = `${this.config.extensionPath}/src/dirTemp`;
    //需要创建的模板目录
    const dirPath = path.join(workDir, dirName);
    shell.mkdir("-p", dirPath);
    if (this.json.isCustomTemplate && this.json.customTeplate) {
      this.cpSync(`${this.json.rootPath}/template`,dirPath)
    } else {
      this.createIndexTsx(`${dirPath}/index.tsx`, dirName);
    }
    // this.createIndexScss(`${dirPath}/.module.scss`);

    shell.exit(1);
  }

  async getCurDir() {
    //若果鼠标点击的是目录this.curPathUrl.fsPath的值为undefined
    const s = this.tag === 'ios' ? this.url.path : this.url.path.slice(1, 2).toUpperCase() + this.url.path.slice(2);
    const stats = await fs.lstatSync(s);
    // stats.isDirectory()和stats.isFile()，可以判断是文件还是文件夹
    if (stats.isDirectory()) {
      if (this.tag === 'ios') {
        return this.url.path;
      } else {
        return this.url.path.slice(1, 2).toUpperCase() + this.url.path.slice(2);
      }
    } else {
      if (this.tag === 'ios') {
        return path.dirname(this.url.path);
      } else {
        return path.dirname((this.url.path.slice(1, 2).toUpperCase() + this.url.path.slice(2)));
      }
    }
  }
  createIndexTsx(fileName: any, dirName: string) {
    let str = dirName[0].toUpperCase() + dirName.slice(1);
    if (/-/.test(dirName)) {
      const arr = dirName.split('-');
      str = arr.reduce((pre, item) => {
        const s = item[0].toUpperCase() + item.slice(1);
        pre = pre + s;
        return pre
      }, '');
    } else if (/_/.test(dirName)) {
      const arr = dirName.split('_');
      str = arr.reduce((pre, item) => {
        const s = item[0].toUpperCase() + item.slice(1);
        pre = pre + s;
        return pre
      }, '');
    }
    const fd = fs.openSync(fileName, 'w');// fs.openSync()方法是fs模块的内置应用程序编程接口，用于返回代表文件描述符的整数值
    // 标记“ r”表示文件已经创建，并且读取创建的文件。标记“ w”表示文件已创建或覆盖
    fs.writeSync(fd, `import React, { useState } from 'react';
import { Card } from '@afe/rocket-ui';



interface Props {

}
interface State {
}


const ${str} = (props:Props)=>{
  const [state,setState] = useState<State>({});
  const changeState = (val)=>setState(old=>({ ...old, ...val }))
  return <div>hello world!!</div>
}

export default ${str}`);
    fs.closeSync(fd);
  }
  // createIndexScss(fileName: fs.PathLike) {
  //   const fd = fs.openSync(fileName, 'w');// fs.openSync()方法是fs模块的内置应用程序编程接口，用于返回代表文件描述符的整数值
  //   // 标记“ r”表示文件已经创建，并且读取创建的文件。标记“ w”表示文件已创建或覆盖
  //   fs.writeSync(fd, `.container{
  //     display: flex;
  //   }`);
  //   fs.closeSync(fd);
  // }
}