// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as shell from 'shelljs';
// import * as path from 'path';
const fs=require('fs');
const path=require('path');

let isJudge=false;

import { MakeDirTemplate } from './MakeDirTemplate';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // const a =JSON.parse(fs.readFileSync(path.resolve(__dirname, './template.json'), 'utf-8'))
  
  
  console.log('Congratulations, your extension "template" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('afe-vscode-template',async (url) => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
  
   const  readDir = async(url: any,originUrl:any) => {
      const dirInfo =await fs.readdirSync(url);
      dirInfo.map((item: any)=>{
       if(item==='package.json'){
        isJudge=true
       }
      });
      if(isJudge){
        try{
          const j = JSON.parse(fs.readFileSync(`${url}/template.json`,'utf-8'))
            j.rootPath=url;
           const tag = shell.pwd()[0].toLowerCase() !== shell.pwd()[0] ? 'win' : 'ios';
           new MakeDirTemplate(context, originUrl, tag,j);
           vscode.window.showInformationMessage('afe template!');
        }catch{
           const tag = shell.pwd()[0].toLowerCase() !== shell.pwd()[0] ? 'win' : 'ios';
           new MakeDirTemplate(context, originUrl, tag,{});
           vscode.window.showInformationMessage('afe template!');
        }
      }else{
        const pa = path.dirname(url)
        readDir(pa.replace(/\\/g,'/'),originUrl)
      }
    }
   try {
   await readDir(url.path.replace(/\\/g,'/').replace('/',''),url)
   } catch (error) {
    const tag = shell.pwd()[0].toLowerCase() !== shell.pwd()[0] ? 'win' : 'ios';
    new MakeDirTemplate(context, url, tag,{});
    vscode.window.showInformationMessage('afe template!');
   }
    
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
