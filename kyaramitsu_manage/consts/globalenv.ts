/**
 * globaenv.ts
 **
 * function：global env variables
**/

/// 定数
// 名前空間 
import { myDev } from "../consts/globalvariables";
// モジュール 
import * as path from 'node:path'; // パス設定用
import { config as dotenv } from 'dotenv'; // 環境変数
// 可変要素
let globalEnvfileName: string = '';
// 開発
if (myDev.DEV_FLG) {
  // 環境ファイル名
  globalEnvfileName = '../.devenv';
} else {
  // 環境ファイル名
  globalEnvfileName = '../.env';
}
// 環境変数
dotenv({ path: path.join(__dirname, globalEnvfileName) });

const globals = {
  LISTEN_PORT: process.env.LISTEN_PORT,
  SQL_HOST: process.env.SQL_HOST,
  SQL_PORT: process.env.SQL_PORT,
  SQL_ADMINUSER: process.env.SQL_ADMINUSER,
  SQL_ADMINPASS: process.env.SQL_ADMINPASS,
  SQL_KEYDBNAME: process.env.SQL_KEYDBNAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

export default globals;