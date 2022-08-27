export const vsWebView =`
<!DOCTYPE html>
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
      </html>
`