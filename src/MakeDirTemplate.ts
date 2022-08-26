import * as shell from 'shelljs';
import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export class MakeDirTemplate {
  config: any;
  url: any;
  panel!: vscode.WebviewPanel;
  webView!: vscode.Webview;
  tag: string;
  constructor(config: any, url: any, tag: string) {
    this.config = config;
    this.url = url;
    this.tag = tag;
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
    if (!this.url.path.includes("src/pages")) {
      vscode.window.showErrorMessage("鼠标必须选中src/pages");
      return false;
    }
    return true;
  }
  loadHtml() {
    if (this.webView) {
      this.webView.html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Cat Coding</title>
        </head>
        <body>
          <div
            style="width: 300px; margin-top: 24px; display: flex; align-items: center"
          >
            输入目录名称
            <input
              id="dirName"
              style="flex-grow: 1; height: 30px; margin-left: 16px"
              placeholder="目录可以包含/"
            />
          </div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              width: 300px;
              margin-top: 24px;
            "
          >
            <div
              id="cancelBtn"
              style="
                width: 80px;
                height: 30px;
                border-radius: 4px;
                border: 1px solid #ededed;
                line-height: 30px;
                text-align: center;
              "
            >
              取消
            </div>
            <div
              id="confirmBtn"
              style="
                width: 80px;
                height: 30px;
                color: #000;
                background-color: rgb(66, 144, 245);
                border-radius: 4px;
                border: none;
                line-height: 30px;
                text-align: center;
              "
            >
              确定
            </div>
          </div>

          <script>
            (function () {
              var vscode = acquireVsCodeApi();
              var submit = document.getElementById("confirmBtn");
              var cancel = document.getElementById("cancelBtn");
              var dirName = document.getElementById("dirName");
              cancel.onclick = function () {
                vscode.postMessage({
                  code: -1,
                });
              };

              submit.onclick = function () {
                if (!dirName.value) {
                  vscode.postMessage({
                    code: -1,
                  });
                  return;
                }
                vscode.postMessage({ // 向插件发送消息
                  code: 0,
                  data: {
                    dirName: dirName.value,
                  },
                });
              };

              dirName.onkeydown = function (e) {
                if(e.keyCode==13){
                  if (!dirName.value) {
                    vscode.postMessage({
                      code: -1,
                    });
                    return;
                  }
                  vscode.postMessage({ // 向插件发送消息
                    code: 0,
                    data: {
                      dirName: dirName.value,
                    },
                  });
                }
              };
            })();
          </script>
        </body>
      </html>`;
    }

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

    this.createIndexTsx(`${dirPath}/index.tsx`, dirName);
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
  createIndexTsx(fileName: fs.PathLike, dirName: string) {
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