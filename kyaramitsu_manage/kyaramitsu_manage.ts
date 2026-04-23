/**
 * kyaramitsu.ts
 **
 * function：kyaramitsuサイト
 **/

'use strict';

/// 定数
// 名前空間 
import { myDev, myConst, myDevConst } from './consts/globalvariables';
import { isAdminAuthenticated } from "./modules/passportModule";
import globals from "./consts/globalenv";
// 可変要素
let globalAppName: string; // アプリ名
let globalEnvfileName: string; // 環境ファイル名
let globalLogLevel: string; // ログレベル
let globalDefaultUrl: string; // デフォルトURL
let globalDefaultPort: number; // ポート番号

/// モジュール
import * as path from 'node:path'; // パス設定用
import { config as dotenv } from 'dotenv'; // 環境変数
import passport from "passport"; // ログイン用
import express from 'express'; // express用
import fileUpload from "express-fileupload"; // ファイルアップロード用
import helmet from "helmet"; // cors設定
import * as adminPassportStrategy from "passport-local"; // 管理者ログイン用
import cookieParser from "cookie-parser"; // クッキー用
import { xss } from "express-xss-sanitizer"; // XSS対策用
import * as session from "express-session"; // セッション用
import mysqlSession from "express-mysql-session"; // セッションDB設定用
import Logger from './class/Logger'; // ロガー用
import MKDir from './class/Mkdir0721'; // フォルダ生成用
import SQL from './class/MySqlJoin0623'; // sql用

// 開発モード
if (myDev.DEV_FLG) {
  globalEnvfileName = '.devenv'; // 環境変数
  globalLogLevel = myDevConst.LOG_LEVEL; // ログレベル
  globalDefaultUrl = myDevConst.DEFAULT_URL; // 基本URL
  globalDefaultPort = Number(globals.LISTEN_PORT); // ポート番号
  globalAppName = myDevConst.APP_NAME!; // アプリ名
  // 本番モード
} else {
  globalEnvfileName = '.env'; // 環境変数
  globalLogLevel = myConst.LOG_LEVEL; // ログレベル
  globalDefaultUrl = myConst.DEFAULT_URL; // 基本URL
  globalDefaultPort = Number(globals.LISTEN_PORT); // ポート番号
  globalAppName = myConst.APP_NAME!; // アプリ名
}
// MYSQL読込
import { countAssets, selectAsset, insertData } from "./modules/mysqlModule"; // DB用

// 環境変数
dotenv({ path: path.join(__dirname, globalEnvfileName) });
// ロガー設定
const logger: Logger = new Logger(myDev.COMPANY_NAME, globalAppName, globalLogLevel);
// フォルダ作成
const mkdirManager = new MKDir(logger);
// express設定
const MySQLStore: any = mysqlSession(session.default);
// DB設定
const myDB: SQL = new SQL(
  process.env.SQL_HOST!, // ホスト名
  process.env.SQL_ADMINUSER!, // ユーザ名
  process.env.SQL_ADMINPASS!, // ユーザパスワード
  Number(process.env.SQL_PORT), // ポートNO
  process.env.SQL_KEYDBNAME!, // DB名
  logger, // ロガー
);
// シークレット文字列
const globalSecretString: string = globals.SESSION_SECRET!;
// セッション保存用
const sessionStore: any = new MySQLStore({
  host: globals.SQL_HOST!,
  port: Number(globals.SQL_PORT),
  user: globals.SQL_ADMINUSER!,
  password: globals.SQL_ADMINPASS!,
  database: globals.SQL_KEYDBNAME!,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
  endConnectionOnClose: true,
  disableTouch: true,
  charset: "charset",
  schema: {
    tableName: "session",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
  waitForConnections: true,
  connectionLimit: 2,
});

/// express設定
const app: any = express();
// 通常設定
app.set('views', path.join(__dirname, 'views'));
// ejsテンプレート使用
app.set('view engine', 'ejs');
// 事前設定読込
app.locals.pluralize = require("pluralize");
// json設定
app.use(express.json());
// body設定
app.use(
  express.urlencoded({
    extended: true, // フォーム受信可
  })
);
// ファイルアップロード
app.use(fileUpload());
// XSS対策
app.use(xss());
// クッキー使用
app.use(cookieParser());
// publicフォルダ設定
app.use(express.static(path.join(__dirname, "public")));
// セッション設定
app.use(session.default({
  secret: globalSecretString,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
}));
// パスポート認証
app.use(passport.authenticate("session"));
// ヘルメット使用
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "code.jquery.com", "cdnjs.cloudflare.com", "postcode-jp.com"],
      "img-src": ["'self'", "data: image:"],
      "connect-src": ["'self'", "cdnjs.cloudflare.com"]
    },
  },
}));

// パスポート設定(管理者)
passport.use("adminLocal", new adminPassportStrategy.Strategy({
  usernameField: "usermail", // 管理者メール
  passwordField: "password" // 管理者パスワード
}, async function (usermail: string, password: string, cb: any) {
  // 該当管理者抽出
  const targetAdmin: any = await selectAsset("admin", ["adminmail", "usable"], [[usermail], [1]]);
  // 登録なし
  if (targetAdmin.length == 0) {
    // 登録なしエラー
    throw new Error("passport: no admin user");
  }
  // 認証チャレンジ
  if (password === targetAdmin[0].password) {
    // 認証成功
    logger.debug("login success");
    return cb(null, { id: targetAdmin[0].id, role: "admin" });
  } else {
    // 認証失敗
    logger.error("login fail");
  }
}));

// ユーザ情報をセッションへ保存
passport.serializeUser((user: any, done: any) => {
  done(null, user);
});
// IDからユーザ情報を取得
passport.deserializeUser(async (user: any, done: any) => {
  // 該当ユーザ抽出
  const targetUser: any = await selectAsset(user.role, ["id", "usable"], [[user.id], [1]]);
  done(null, targetUser);
});

// トップ画面
app.get('/', isAdminAuthenticated, async (_: any, res: any) => {
  try {
    logger.info('manage: shop regist connected');
    // 登録画面表示
    res.render('index.ejs', {
      title: "kyaramitsu管理画面", // タイトル
    });

  } catch (e: unknown) {
    logger.error(e);
  }
});

// 管理者ログイン画面
app.get("/login", async (_: any, res: any) => {
  try {
    logger.debug("manage: login connected");
    // 管理者ログイン
    res.render("login.ejs", {
      title: "kyaramitsu管理者ログイン", // タイトル
      message: "",
    });

  } catch (e) {
    logger.error(e);
  }
});

// 管理者登録画面
app.get("/manage_regist", async (_: any, res: any) => {
  try {
    logger.debug("manage: login connected");
    // 管理者ログイン
    res.render("registration.ejs", {
      root: globalDefaultUrl,
      title: "管理者登録画面", // タイトル
      message: "",
    });

  } catch (e) {
    logger.error(e);
  }
});

// 店舗登録画面
app.get('/shop_regist', isAdminAuthenticated, async (_: any, res: any) => {
  try {
    logger.info('manage: shop regist connected');
    // 店舗画面表示
    res.render('shop_regist.ejs', {
      root: globalDefaultUrl,
      title: "店舗登録画面", // タイトル
    });

  } catch (e: unknown) {
    logger.error(e);
  }
});

// 店舗編集画面
app.get('/shop_edit', isAdminAuthenticated, async (req: any, res: any) => {
  try {
    logger.info('manage: shop edit connected');
    // カラム
    let tmpColumns: string[];
    // 値
    let tmpValues: any[];
    // 都道府県
    const prefectureid: any = req.query.prefecture;
    // 都道府県
    if (prefectureid) {
      tmpColumns = ['prefecture_id', 'usable'];
      tmpValues = [prefectureid, 1];
      // なし
    } else {
      tmpColumns = ['usable'];
      tmpValues = [[1]];
    }
    // 対象データ
    let shopSelectArgs: selectargs = {
      table: 'shop', // テーブル
      columns: tmpColumns, // カラム
      values: tmpValues, // 値
      limit: undefined, // 上限
    };
    // 対象店舗データ取得
    const targetShopData: any = await myDB.selectDB(shopSelectArgs);
    // 結果
    if (targetShopData == 'error') {
      // ヒットなし
      res.render('error.ejs', {
        title: 'DB検索エラー',
        message: '店舗検索に失敗しました。',
      });
      // DBエラー
      throw new Error('mysql: selectShop error');

    } else if (targetShopData == 'empty') {
      // 結果
      res.render('shop_edit.ejs', {
        title: "店舗一覧画面",
        data: [],
      });

    } else {
      // 結果
      res.render('shop_edit.ejs', {
        title: "店舗一覧画面",
        data: targetShopData,
      });
      logger.trace('mysql: selectShop end');
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});

// 店舗編集ページ表示
app.get('/editpage', isAdminAuthenticated, async (req: any, res: any) => {
  try {
    logger.info('manage: shop edit posted');
    // 店舗ID
    const shopid: any = req.query.id;

    // 店舗IDなし
    if (!shopid) {
      // DBエラー
      throw new Error('no necessary data');
    }
    // 対象データ
    let shopSelectArgs: selectargs = {
      table: 'shop', // テーブル
      columns: ['id', 'usable'], // カラム
      values: [[Number(shopid)], [1]], // 値
      limit: 1, // 上限
    };
    // 対象店舗データ取得
    const targetShopData: any = await myDB.selectDB(shopSelectArgs);
    // 結果
    if (targetShopData == 'error') {
      // ヒットなし
      res.render('error.ejs', {
        title: 'DB検索エラー',
        message: '店舗検索に失敗しました。',
      });
      // DBエラー
      throw new Error('mysql: selectShop error');

    } else if (targetShopData == 'empty') {
      // DBエラー
      throw new Error('mysql: selectShop empty error');

    } else {
      // 結果
      res.render('shop_edit_detail.ejs', {
        title: '店舗編集画面',
        data: targetShopData[0]
      });
      logger.trace('mysql: selectShop end');
    }


  } catch (e: unknown) {
    logger.error(e);
  }
});

/// post
// ログイン
app.post("/login", passport.authenticate("adminLocal", {
  successReturnToOrRedirect: "/",
  failureRedirect: "/login",
  failureMessage: true,
}));


// 新規管理者登録
app.post("/managereg", async (req: any, res: any) => {
  try {
    logger.debug("manage: managereg mode");
    // 管理者名
    const adminName: any = req.body.adminname ?? "";
    // 管理者メール
    const adminMail: any = req.body.adminmail ?? "";
    // パスワード
    const hashedPassword: any = req.body.hashedpassword ?? "";
    // データ無し
    if (adminName == "" || adminMail == "" || hashedPassword == "") {
      // エラー
      throw new Error("managereg: no necessary data");
    }
    // 対象データ数
    const adminCnt: number = await countAssets("admin", ["adminmail", "usable"], [[adminMail], [1]]);
    // 登録なし
    if (adminCnt != 0) {
      // エラー
      throw new Error("managereg: manager already exists");
    }
    // 登録
    await insertData("admin", ["adminname", "adminmail", "password", "usable"], [adminName, adminMail, hashedPassword, 1]);
    logger.debug("manage: managereg completed");
    // 完了画面
    res.render("complete.ejs", {
      redirect: globalDefaultUrl,
      title: "完了",
      message: "管理者登録が完了しました。",
    });

  } catch (e: unknown) {
    logger.error(e);
    // 新規管理者登録
    res.render("registration_manage.ejs", {
      title: "新規管理者登録", // タイトル
      message: "すでに登録されています。別のメールアドレスで登録して下さい。" // メッセージ
    });
  }
});

// 店舗登録
app.post('/regist', isAdminAuthenticated, async (req: any, res: any) => {
  try {
    logger.info('manage: shop reg posted');
    // 受信データ
    const reqCustomerno: any = req.body.customerno; // 顧客番号
    const reqShopname: any = req.body.shopname; // 店舗名
    const reqHeadline: any = req.body.headline; // 見出し
    const reqDetail: any = req.body.detail; // 店舗詳細
    const reqStartTime1: any = req.body.businesstime1_1; // 営業開始時間1
    const reqEndTime1: any = req.body.businesstime1_2; // 営業終了時間1
    const reqStartTime2: any = req.body.businesstime2_1; // 営業開始時間2
    const reqEndTime2: any = req.body.businesstime2_2; // 営業終了時間2
    const reqZip: any = req.body.zip; // 郵便番号
    const reqAddress: any = req.body.address; // 住所
    const reqCityname: any = req.body.cityname; // 認定エリア名
    const reqHoliday: any = req.body.holiday; // 定休日
    const reqPathFile1: any = req.body.filepath1; // ファイル1
    const reqPathFile2: any = req.body.filepath2; // ファイル2
    const reqPathFile3: any = req.body.filepath3; // ファイル3
    const reqPathFile4: any = req.body.filepath4; // ファイル4
    const reqPathFile5: any = req.body.filepath5; // ファイル5

    // 登録アリ
    if (!reqCustomerno || !reqShopname || !reqCityname || !reqHeadline || !reqZip || !reqAddress) {
      // 店舗名なしエラー
      throw new Error('regist: no necessary data error');
    }
    // 都道府県抽出
    const prefecturename: string = reqAddress.match(/..+?[都道府県]/);
    // ヒットなし
    if (!prefecturename) {
      throw new Error('regist: 都道府県が含まれていません');
    }
    // 該当管理者抽出
    const targetPref: any = await selectAsset("prefecture", ["prefecturename", "usable"], [[prefecturename], [1]]);
    // 登録なし
    if (targetPref.length == 0) {
      // 登録なしエラー
      throw new Error("regist: 都道府県がありません");
    }
    //　エリアコード
    const areaCode: number = targetPref[0].area_id;
    //　都道府県コード
    const prefCode: number = targetPref[0].id;

    // 店舗データ登録
    const insertShopArgs: insertargs = {
      table: 'shop', // 店舗
      columns: [
        'area_id', // エリアID
        'shopname', // 店舗名
        'headline', // 見出し
        'detail', // 店舗詳細
        'prefecture_id', // 都道府県
        'customerno', // 顧客番号
        'cityname', // 認定エリア名
        'starttime1', // 営業開始時間1
        'endtime1', // 営業終了時間1
        'starttime2', // 営業開始時間2
        'endtime2', // 営業終了時間2
        'zip', // 郵便番号
        'address', // 住所
        'holiday', // 定休日
        'imageurl1', // 画像1
        'imageurl2', // 画像2
        'imageurl3', // 画像3
        'imageurl4', // 画像4
        'imageurl5', // 画像5
        'display', // 表示
        'usable' // 使用可能
      ],
      values: [
        areaCode, // エリアID
        reqShopname, // 店舗名
        reqHeadline, // 見出し
        reqDetail, // 店舗詳細
        prefCode, // 都道府県
        Number(reqCustomerno), // 顧客番号
        reqCityname, // 認定エリア名
        reqStartTime1, // 営業開始時間1
        reqEndTime1, // 営業終了時間1
        reqStartTime2, // 営業開始時間2
        reqEndTime2, // 営業終了時間2
        reqZip, // 郵便番号
        reqAddress, // 住所
        reqHoliday, // 定休日
        reqPathFile1, // 画像1
        reqPathFile2, // 画像2
        reqPathFile3, // 画像3
        reqPathFile4, // 画像4
        reqPathFile5, // 画像5
        1, // 表示
        1 // 使用可能
      ]
    };
    // 店舗DB格納
    const tmpShopReg: any = await myDB.insertDB(insertShopArgs);
    // エラー
    if (tmpShopReg === 'error' || tmpShopReg === 'empty') {
      // DB追加エラー（トランザクション）
      throw new Error('regist: 店舗追加エラー');
    } else {
      logger.info(
        `regist: 店舗追加完了: ${reqShopname}.`
      );
      // ファイルアップロードあり
      if (req.files) {
        const reqFile1: any = req.files.file1 ?? null;
        const reqFile2: any = req.files.file2 ?? null;
        const reqFile3: any = req.files.file3 ?? null;
        const reqFile4: any = req.files.file4 ?? null;
        const reqFile5: any = req.files.file5 ?? null;

        if (reqFile1) {
          // 画像保存
          await savImageFile(reqFile1, 'imageurl1', tmpShopReg);
        }
        if (reqFile2) {
          // 保存パス
          await savImageFile(reqFile2, 'imageurl2', tmpShopReg);
        }
        if (reqFile3) {
          // 保存パス
          await savImageFile(reqFile3, 'imageurl3', tmpShopReg);
        }
        if (reqFile4) {
          // 保存パス
          await savImageFile(reqFile4, 'imageurl4', tmpShopReg);
        }
        if (reqFile5) {
          // 保存パス
          await savImageFile(reqFile5, 'imageurl5', tmpShopReg);
        }
      }
    }
    logger.info('manage: shop reg completed');
    // 完了
    res.render('complete.ejs', {
      root: globalDefaultUrl,
      title: '完了', // タイトル
      message: '店舗登録が完了しました。', // メッセージ
    });

  } catch (e: unknown) {
    logger.error(e);
  }
});

// 店舗登録
app.post('/edit', isAdminAuthenticated, async (req: any, res: any) => {
  try {
    logger.info('manage: shop edit posted');
    // 変数
    let tmpDisplay: number; // 表示
    let tmpUseOriginal: number; // オリジナル画像
    // 受信データ
    const reqShopID: any = req.body.id; // 店舗ID
    const reqCustomerno: any = req.body.customerno; // 顧客番号
    const reqShopname: any = req.body.shopname; // 店舗名
    const reqHeadline: any = req.body.headline; // 見出し
    const reqDetail: any = req.body.detail; // 店舗詳細
    const reqGenre: any = req.body.genre; // ジャンル
    const reqDetailSource: any = req.body.detailsource; // 店舗詳細文章出典
    const reqStartTime1: any = req.body.businesstime1_1; // 営業開始時間1
    const reqEndTime1: any = req.body.businesstime1_2; // 営業終了時間1
    const reqStartTime2: any = req.body.businesstime2_1; // 営業開始時間2
    const reqEndTime2: any = req.body.businesstime2_2; // 営業終了時間2
    const reqBAnnotation: any = req.body.b_annotation; // 営業時間補足
    const reqZip: any = req.body.zip; // 郵便番号
    const reqAddress: any = req.body.address; // 住所
    const reqHoliday: any = req.body.holiday; // 定休日
    const reqHAnnotation: any = req.body.h_annotation; // 定休日補足
    const reqCityname: any = req.body.cityname; // 認定エリア名
    const reqPathFile1: any = req.body.filepath1; // ファイル1
    const reqPathFile2: any = req.body.filepath2; // ファイル2
    const reqPathFile3: any = req.body.filepath3; // ファイル3
    const reqPathFile4: any = req.body.filepath4; // ファイル4
    const reqPathFile5: any = req.body.filepath5; // ファイル5
    const reqOriginalImg: any = req.body.originalimage; // オリジナル画像
    const reqImgSource: any = req.body.imagesource; // 画像出典
    const useoriginalIndex: any = req.body.useoriginal ?? []; // オリジナル画像使用
    const displayIndex: any = req.body.display ?? []; // 表示
    console.log(reqOriginalImg);
    // 登録アリ
    if (!reqShopID || !reqShopname || !reqCityname || !reqHeadline || !reqZip || !reqAddress) {
      // 店舗名なしエラー
      throw new Error('regist: no necessary data error');
    }
    // 都道府県抽出
    const prefecturename: string = reqAddress.match(/..+?[都道府県]/);
    // ヒットなし
    if (!prefecturename) {
      throw new Error('regist: 都道府県が含まれていません');
    }
    // 該当管理者抽出
    const targetPref: any = await selectAsset("prefecture", ["prefecturename", "usable"], [[prefecturename], [1]]);
    // 登録なし
    if (targetPref.length == 0) {
      // 登録なしエラー
      throw new Error("regist: 都道府県がありません");
    }
    //　エリアコード
    const areaCode: number = targetPref[0].area_id;
    //　都道府県コード
    const prefCode: number = targetPref[0].id;

    if (useoriginalIndex.length > 0 && useoriginalIndex[0] == String(reqShopID)) {
      tmpUseOriginal = 1;
    } else {
      tmpUseOriginal = 0;
    }
    if (displayIndex.length > 0 && displayIndex[0] == String(reqShopID)) {
      tmpDisplay = 1;
    } else {
      tmpDisplay = 0;
    }
    console.log(tmpUseOriginal);
    console.log(tmpDisplay);

    // カラム
    const tmpShopColumns: string[] = [
      'area_id', // エリアID
      'prefecture_id', // 都道府県
      'customerno', // 顧客番号
      'shopname', // 店舗名
      'headline', // 見出し
      'detail', // 店舗詳細
      'detailsource', // 店舗詳細文章出典
      'genre', // ジャンル
      'cityname', // 認定エリア名
      'starttime1', // 営業開始時間1
      'endtime1', // 営業終了時間1
      'starttime2', // 営業開始時間2
      'endtime2', // 営業終了時間2
      'bannotation', // 営業時間補足
      'zip', // 郵便番号
      'address', // 住所
      'holiday', // 定休日
      'hannotation', // 定休日補足
      'imageurl1', // 画像1
      'imageurl2', // 画像2
      'imageurl3', // 画像3
      'imageurl4', // 画像4
      'imageurl5', // 画像5
      'originalimageurl', // オリジナル画像
      'imagesource', // 画像出典
      'useoriginal', // オリジナル画像使用
      'display', // 表示
      'usable' // 使用可能
    ];
    // 値
    const tmpShopValues: any[] = [
      areaCode, // エリアID
      prefCode, // 都道府県
      Number(reqCustomerno), // 顧客番号
      reqShopname, // 店舗名
      reqHeadline, // 見出し
      reqDetail, // 店舗詳細
      reqDetailSource, // 店舗詳細文章出典
      reqGenre, // ジャンル
      reqCityname, // 認定エリア名
      reqStartTime1, // 営業開始時間1
      reqEndTime1, // 営業終了時間1
      reqStartTime2, // 営業開始時間2
      reqEndTime2, // 営業終了時間2
      reqBAnnotation, // 営業時間補足
      reqZip, // 郵便番号
      reqAddress, // 住所
      reqHoliday, // 定休日
      reqHAnnotation, // 定休日補足
      reqPathFile1, // 画像1
      reqPathFile2, // 画像2
      reqPathFile3, // 画像3
      reqPathFile4, // 画像4
      reqPathFile5, // 画像5
      reqOriginalImg, // オリジナル画像
      reqImgSource, // 画像出典
      tmpUseOriginal, // オリジナル画像使用
      tmpDisplay, // 表示
      1 // 使用可能
    ]
    // 店舗情報更新用
    const updateShopArgs: updateargs = {
      table: 'shop', // テーブル
      setcol: tmpShopColumns, // 準備完了
      setval: tmpShopValues, // 待機状態
      selcol: ['id', 'usable'], // 対象
      selval: [Number(reqShopID), 1], // 対象値
    };
    // 店舗情報更新
    const updateShopResult: any = await myDB.updateDB(updateShopArgs);
    // 結果
    if (updateShopResult == 'error') {
      // エラー
      throw new Error('mysql: shop update error');
    } else if (updateShopResult == 'empty') {
      // 対象なし
      logger.debug('mysql: shop update empty');
    } else {
      logger.debug("mysql: shop update success");
      // ファイルアップロードあり
      if (req.files) {
        const reqFile1: any = req.files.file1 ?? null;
        const reqFile2: any = req.files.file2 ?? null;
        const reqFile3: any = req.files.file3 ?? null;
        const reqFile4: any = req.files.file4 ?? null;
        const reqFile5: any = req.files.file5 ?? null;
        if (reqFile1) {
          // 画像保存
          await savImageFile(reqFile1, 'imageurl1', reqShopID);
        }
        if (reqFile2) {
          // 保存パス
          await savImageFile(reqFile2, 'imageurl2', reqShopID);
        }
        if (reqFile3) {
          // 保存パス
          await savImageFile(reqFile3, 'imageurl3', reqShopID);
        }
        if (reqFile4) {
          // 保存パス
          await savImageFile(reqFile4, 'imageurl4', reqShopID);
        }
        if (reqFile5) {
          // 保存パス
          await savImageFile(reqFile5, 'imageurl5', reqShopID);
        }
      }
    }
    logger.info('manage: shop edit completed');
    // 完了
    res.render('complete.ejs', {
      root: globalDefaultUrl + 'shop_edit?prefecture=' + prefCode, // ルートURL
      title: '完了', // タイトル
      message: '店舗編集が完了しました。', // メッセージ
    });

  } catch (e: unknown) {
    logger.error(e);
  }
});

// 店舗削除
app.post('/delete', isAdminAuthenticated, async (req: any, res: any) => {
  try {
    logger.info('manage: shop delete posted');
    // 受信データ
    const reqShopID: any = req.body.id; // 店舗ID
    // カラム
    const tmpDeleteColumns: string[] = ['usable'];
    // 値
    const tmpDeleteValues: any[] = [[0]];
    // 店舗情報更新用
    const disableDeleteArgs: updateargs = {
      table: 'shop', // テーブル
      setcol: tmpDeleteColumns, // 準備完了
      setval: tmpDeleteValues, // 待機状態
      selcol: ['id', 'usable'], // 対象
      selval: [Number(reqShopID), 1], // 対象値
    };
    // 店舗無効化
    const updateDeleteResult: any = await myDB.updateDB(disableDeleteArgs);
    // エラー
    if (updateDeleteResult === 'error') {
      // DB追加エラー（トランザクション）
      throw new Error('mysql: 店舗無効化エラー');

    } else {
      logger.info('manage: shop disable completed');
      // 完了
      res.render('complete.ejs', {
        root: globalDefaultUrl, // ルートURL
        title: '完了', // タイトル
        message: '店舗削除が完了しました。', // メッセージ
      });
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});

// エラーハンドラ
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    __: express.NextFunction,
  ) => {
    logger.error(err);
    res.send('error');
  }
);

// 待機
app.listen(globalDefaultPort, () => {
  logger.info(
    `GMO card app listening at ${globalDefaultUrl}:${globalDefaultPort}`
  );
});

// 画像保存
const savImageFile = async (file: any, column: string, shopid: number) => {
  // パス
  const savePath: string = path.join(__dirname, '..', 'kyaramitsu', 'public', 'images', String(shopid));
  // パス
  const filePath: string = path.join('/images', String(shopid), file.name);
  // フォルダ作成
  await mkdirManager.mkDir(savePath);
  // 保存パス
  const saveFilePath: string = path.join(savePath, file.name);
  // 画像ファイル保存
  file.mv(saveFilePath, async (err: any) => {
    if (err) {
      logger.error(err);
    } else {
      // 画像パス更新
      const updateImageArgs: updateargs = {
        table: 'shop', // テーブル
        setcol: [column], // 準備完了
        setval: [filePath], // 待機状態
        selcol: ['id', 'usable'], // 対象
        selval: [shopid, 1], // 対象値
      };
      // 画像パスDB更新
      const updateImgPathResult: any = await myDB.updateDB(updateImageArgs);
      // 結果
      if (updateImgPathResult == 'error') {
        // エラー
        throw new Error('mysql: shop error');
      } else if (updateImgPathResult == 'empty') {
        // 対象なし
        logger.debug('mysql: shop empty');
      } else {
        logger.debug("Successfully Uploaded !!");
      }
    }
  });
}
