/**
 * kyaramitsu.ts
 **
 * function：kyaramitsuサイト
 **/

'use strict';

/// 定数
// 名前空間 
import { myDev, myConst, myDevConst } from './consts/globalvariables';
// 可変要素
let globalAppName: string; // アプリ名
let globalEnvfileName: string; // 環境ファイル名
let globalLogLevel: string; // ログレベル
let globalDefaultUrl: string; // デフォルトURL

/// モジュール
import * as path from 'node:path'; // パス設定用
import { config as dotenv } from 'dotenv'; // 環境変数
import cors from 'cors'; // セキュリティ対策用
import express from 'express'; // express用
import Logger from './class/Logger'; // ロガー用
import SQL from './class/MySqlJoin0623'; // sql用

/// モジュール設定
// 開発モード
if (myDev.DEV_FLG) {
  globalEnvfileName = '.devenv'; // 環境変数
  globalLogLevel = myDevConst.LOG_LEVEL; // ログレベル
  globalDefaultUrl = myDevConst.DEFAULT_URL; // 基本URL
  globalAppName = myDevConst.APP_NAME!; // アプリ名
  // 本番モード
} else {
  globalEnvfileName = '.env'; // 環境変数
  globalLogLevel = myConst.LOG_LEVEL; // ログレベル
  globalDefaultUrl = myConst.DEFAULT_URL; // 基本URL
  globalAppName = myConst.APP_NAME!; // アプリ名
}
// 環境変数
dotenv({ path: path.join(__dirname, globalEnvfileName) });
// ポート番号
const globalDefaultPort: number = Number(process.env.LISTEN_PORT); // ポート番号
// ロガー設定
const logger: Logger = new Logger(myDev.COMPANY_NAME, globalAppName, globalLogLevel);
// DB設定
const myDB: SQL = new SQL(
  process.env.SQL_HOST!, // ホスト名
  process.env.SQL_ADMINUSER!, // ユーザ名
  process.env.SQL_ADMINPASS!, // ユーザパスワード
  Number(process.env.SQL_PORT), // ポートNO
  process.env.SQL_KEYDBNAME!, // DB名
  logger, // ロガー
);
/// express設定
const app: any = express();
// publicフォルダ設定
app.use(express.static(path.join(__dirname, 'public')));
// 通常設定
app.set('views', path.join(__dirname, 'views'));
// ejsテンプレート使用
app.set('view engine', 'ejs');
// json設定
app.use(express.json());
// body設定
app.use(
  express.urlencoded({
    extended: true, // フォーム受信可
  })
);
// cors使用
app.use(cors());

// ユーザ画面
/// get
// トップページ
app.get('/', async (_: any, res: any) => {
  try {
    logger.debug('top: top started');
    // 全店舗カウント
    let shopAreaCountArgs: countargs = {
      table: 'shop', // テーブル
      columns: ['display', 'usable'], // カラム
      values: [[1], [1]], // 値
    };
    // 対象店舗データ取得
    const shopCount: number = await myDB.countDB(shopAreaCountArgs);
    // 全体初期リスト表示
    let shopAreaSelectArgs: selectargs = {
      table: 'shop', // テーブル
      columns: ['display', 'usable'], // カラム
      values: [[1], [1]], // 値
      order1: 'useoriginal',
      order2: 'headline',
      order3: 'imageurl1',
      reverse: true,
      offset: 0, // 開始
      limit: myDev.PAGENUM, // 上限
    };
    // 対象店舗データ取得
    const selectedShopData: any = await myDB.selectDB(shopAreaSelectArgs);
    // 結果
    if (selectedShopData == 'error') {
      // DBエラー
      throw new Error('mysql: selectShop error');

    } else if (selectedShopData == 'empty') {
      // ヒットなし
      res.render('index', {
        root: myConst.DEFAULT_URL,
        data: [],
        areaname: '',
        mode: 'area/',
        area: '99/',
        page: 1,
        prefectureids: [],
        prefecturenames: [],
        areanames: [],
        areaid: 99,
        total: 0,
      });
      logger.trace('mysql: selectShop empty');

    } else {
      // 結果
      res.render('index', {
        root: myConst.DEFAULT_URL,
        data: selectedShopData,
        areaname: '',
        mode: 'area/',
        area: '99/',
        page: 1,
        prefectureids: [],
        prefecturenames: [],
        areanames: [],
        areaid: 99,
        total: shopCount,
      });
      logger.trace('mysql: selectShop end');
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});

app.get('/area/:areaid/:page', async (req: any, res: any) => {
  try {
    logger.debug('top: area started');
    // カラム
    let tmpColumns: string[] = [];
    // 値
    let tmpValues: any[] = [];
    // オフセット
    let pageOffset: number = 0;
    // 対象ページ
    const page: any = req.params.page ?? null;
    // ページ数
    const pageNo: number = Number(page);
    // エリアID
    const areaid: string = req.params.areaid;
    // 開始番号
    if (!page) {
      // DBエラー
      throw new Error('query: incorrect query error');
    } else if (page == 1) {
      pageOffset = 0;
    } else {
      pageOffset = (Number(page) - 1) * myDev.PAGENUM + 1;
    }
    // 全国対応
    if (areaid == '99') {
      tmpColumns = ['display', 'usable'];
      tmpValues = [[1], [1]];
    } else {
      tmpColumns = ['area_id', 'display', 'usable'];
      tmpValues = [[Number(areaid)], [1], [1]];
    }
    // 全店舗カウント
    let shopAreaCountArgs: countargs = {
      table: 'shop', // テーブル
      columns: tmpColumns, // カラム
      values: tmpValues, // 値
    };
    // 対象店舗データ取得
    const shopCount: number = await myDB.countDB(shopAreaCountArgs);
    // 全体初期リスト表示
    let shopAreaSelectArgs: selectargs = {
      table: 'shop', // テーブル
      columns: tmpColumns, // カラム
      values: tmpValues, // 値
      order1: 'useoriginal',
      order2: 'headline',
      order3: 'imageurl1',
      reverse: true,
      offset: pageOffset, // 開始
      limit: myDev.PAGENUM, // 上限
    };
    // 対象店舗データ取得
    const selectedShopData: any = await myDB.selectDB(shopAreaSelectArgs);
    // 結果
    if (selectedShopData == 'error') {
      // DBエラー
      throw new Error('mysql: selectareaShop error');

    } else if (selectedShopData == 'empty') {
      logger.trace('mysql: selectareaShop empty');
      // ヒットなし
      res.render('index', {
        root: myConst.DEFAULT_URL,
        data: [],
        mode: 'area/',
        area: areaid + '/',
        page: 1,
        prefectureids: [],
        prefecturenames: [],
        areanames: [],
        areaid: areaid,
        total: shopCount,
      });

    } else {
      // 一時保存用
      let tmpPrefIds: number[] = [];
      let tmpAreaNames: string[] = [];
      let tmpPrefNames: string[] = [];

      // 全国対応以外
      if (areaid != '99') {
        // 対象データ
        const areaPrefJoinSelectArgs: joinargs = {
          table: 'area', // テーブル
          columns: ['id', 'usable'], // カラム
          values: [[Number(areaid)], [1]], // 値
          originid: 'id',
          jointable: 'prefecture',
          joincolumns: ['usable'], // カラム
          joinvalues: [[1]], // 値
          joinid: 'area_id',
          limit: myDev.PAGENUM, // 上限
          fields: ['prefecture.id', 'areaname', 'prefecturename'],
        };
        // 対象店舗データ取得
        const selectedAreaPrefData: any = await myDB.selectJoinDB(areaPrefJoinSelectArgs);
        // 結果
        if (selectedAreaPrefData == 'error') {
          // DBエラー
          throw new Error('mysql: selectareaShop error');

        } else if (selectedAreaPrefData == 'empty') {
          // 空欄に
          throw new Error('mysql: selectareaShop empty');

        } else {
          selectedAreaPrefData.forEach((areapref: any) => {
            tmpAreaNames.push(areapref.areaname);
            tmpPrefIds.push(areapref.id);
            tmpPrefNames.push(areapref.prefecturename);
          });
          // 結果
          res.render('index', {
            root: myConst.DEFAULT_URL,
            data: selectedShopData,
            mode: 'area/',
            area: areaid + '/',
            page: pageNo,
            prefectureids: tmpPrefIds,
            prefecturenames: tmpPrefNames,
            areanames: tmpAreaNames,
            areaid: areaid,
            total: shopCount,
          });
          logger.trace('mysql: selectareaShop end');
        }
      } else {
        // 結果
        res.render('index', {
          root: myConst.DEFAULT_URL,
          data: selectedShopData,
          mode: 'area/',
          area: areaid + '/',
          page: pageNo,
          prefectureids: [],
          prefecturenames: [],
          areanames: [],
          areaid: 99,
          total: shopCount,
        });
        logger.trace('mysql: selectareaShop end');
      }
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});


// 都道府県ページ
app.get('/pref/:prefid/:page', async (req: any, res: any) => {
  try {
    logger.debug('top: pref started');
    // ページ数
    let pageOffset: number = 0;
    // 対象ページ
    const page: any = req.params.page ?? null;
    // ページ数
    const pageNo: number = Number(page);
    // 都道府県ID
    const prefid: string = req.params.prefid;
    // 開始番号
    if (!page) {
      // DBエラー
      throw new Error('query: incorrect query error');
    } else if (page == 1) {
      pageOffset = 0;
    } else {
      pageOffset = (Number(page) - 1) * myDev.PAGENUM + 1;
    }
    // 全店舗カウント
    let shopAreaCountArgs: countargs = {
      table: 'shop', // テーブル
      columns: ['prefecture_id', 'display', 'usable'], // カラム
      values: [[Number(prefid)], [1], [1]], // 値
    };
    // 対象店舗データ取得
    const shopCount: number = await myDB.countDB(shopAreaCountArgs);
    // 対象データ
    let shopPrefSelectArgs: selectargs = {
      table: 'shop', // テーブル
      columns: ['prefecture_id', 'display', 'usable'], // カラム
      values: [[Number(prefid)], [1], [1]], // 値
      offset: pageOffset, // 開始
      limit: myDev.PAGENUM, // 上限
      reverse: true,
      order1: 'useoriginal',
      order2: 'headline',
      order3: 'imageurl1',
    };
    // 対象店舗データ取得
    const selectedPrefShopData: any = await myDB.selectDB(shopPrefSelectArgs);
    // 結果
    if (selectedPrefShopData == 'error') {
      // DBエラー
      throw new Error('mysql: selectprefShop error');

    } else if (selectedPrefShopData == 'empty') {
      // ヒットなし
      res.render('index', {
        root: myConst.DEFAULT_URL,
        data: [],
        mode: 'pref/',
        area: prefid + '/',
        page: pageNo,
        prefectureids: [],
        prefecturenames: [],
        areanames: [],
        areaid: 0,
        total: shopCount,
      });
      logger.trace('mysql: selectprefShop empty');

    } else {
      // エリアID
      const areaId: number = selectedPrefShopData[0].area_id;
      // 対象データ
      let shopPrefSelectArgs: selectargs = {
        table: 'prefecture', // テーブル
        columns: ['area_id', 'usable'], // カラム
        values: [[selectedPrefShopData[0].area_id], [1]], // 値
        limit: myDev.PAGENUM, // 上限
        reverse: true,
      };
      // 対象店舗データ取得
      const selectedPrefData: any = await myDB.selectDB(shopPrefSelectArgs);
      // 結果
      if (selectedPrefData == 'error') {
        // DBエラー
        throw new Error('mysql: selectedPrefData error');

      } else if (selectedPrefData == 'empty') {
        // ヒットなし
        res.render('index', {
          root: myConst.DEFAULT_URL,
          data: [],
          mode: 'pref/',
          area: prefid + '/',
          page: pageNo,
          prefectureids: [],
          prefecturenames: [],
          areanames: [],
          areaid: 0,
          total: shopCount,
        });
        logger.trace('mysql: selectprefShop empty');

      } else {
        // 都道府県ID
        const prefids: any = selectedPrefData.map((pref: any) => {
          return pref.id;
        });
        // 都道府県名
        const prefnames: any = selectedPrefData.map((pref: any) => {
          return pref.prefecturename;
        });
        // 結果
        res.render('index', {
          root: myConst.DEFAULT_URL,
          data: selectedPrefShopData,
          mode: 'pref/',
          area: prefid + '/',
          page: pageNo,
          prefectureids: prefids,
          prefecturenames: prefnames,
          areanames: [],
          areaid: areaId,
          total: shopCount,
        });
      }
      logger.trace('mysql: selectprefShop end');
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});


// 店舗ページ
app.get('/shop/:shopid', async (req: any, res: any) => {
  try {
    logger.debug('top: shop started');
    // ページ数
    let pageOffset: number = 0;
    // 店舗ID
    const shopid: string = req.params.shopid;
    // 対象データ
    let shopJoinSelectArgs: joinargs = {
      table: 'shop', // テーブル
      columns: ['id', 'display', 'usable'], // カラム
      values: [[Number(shopid)], [1], [1]], // 値
      originid: 'area_id',
      jointable: 'area',
      joincolumns: ['usable'], // カラム
      joinvalues: [[1]], // 値
      joinid: 'id',
      offset: pageOffset, // 開始
      order1: 'useoriginal',
      order2: 'headline',
      order3: 'imageurl1',
      ordertable: 'shop',
      reverse: true,
      limit: myDev.PAGENUM, // 上限
    };
    // 対象店舗データ取得
    let selectedShopData: any = await myDB.selectJoinDB(shopJoinSelectArgs);
    // 結果
    if (selectedShopData == 'error') {
      // DBエラー
      throw new Error('mysql: selectShop error');

    } else if (selectedShopData == 'empty') {
      // ヒットなし
      res.render('shop', {
        root: myConst.DEFAULT_URL,
        data: [],
        prefecture: '',
        address: '',
      });
      logger.trace('mysql: selectShop empty');

    } else {
      // 置換後住所
      let tmpReplacedAddress = "";
      // 都道府県一致
      const prefRegex = /..+?[都道府県]/;
      // 住所
      const tmpAddress: string = selectedShopData[0].address;
      // 都道府県を含む
      if (prefRegex.test(tmpAddress)) {
        tmpReplacedAddress = tmpAddress.replace(prefRegex, "")
      } else {
        tmpReplacedAddress = tmpAddress;
      }
      // 都道府県
      let prefSelectArgs: selectargs = {
        table: 'prefecture', // テーブル
        columns: ['id', 'usable'], // カラム
        values: [[Number(selectedShopData[0].prefecture_id)], [1]], // 値
      };
      // 対象都道府県データ取得
      const selectedPrefData: any = await myDB.selectDB(prefSelectArgs);
      // 結果
      if (selectedPrefData == 'error') {
        // DBエラー
        throw new Error('mysql: selectprefShop error');

      } else if (selectedPrefData == 'empty') {
        // ヒットなし
        res.render('shop', {
          root: myConst.DEFAULT_URL,
          data: [],
          prefecture: '',
          address: '',
        });
        logger.trace('mysql: selectPref empty');
      } else {
        // 結果
        res.render('shop', {
          root: myConst.DEFAULT_URL, // ルート
          data: selectedShopData[0], // 店舗データ
          prefecture: selectedPrefData[0].prefecturename,
          address: tmpReplacedAddress,
        });
        logger.trace('mysql: selectShop end');
      }
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
