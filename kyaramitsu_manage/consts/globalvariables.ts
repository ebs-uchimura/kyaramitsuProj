/**
 * globalvariables.ts
 **
 * function：global variables
**/

/** my const */
export namespace myDev {
  export const DEV_FLG: boolean = false;
  export const COMPANY_NAME: string = 'Ebisudo';
  export const ERROR_MESSAGE: string = 'カートが空です';
  export const PAGENUM: number = 20;
}

export namespace myConst {
  export const APP_NAME: string = 'KyaramitsuManager';
  export const DEFAULT_URL: string = 'https://manage.ebisu-do.jp/';
  export const LOG_LEVEL: string = 'all';
}

export namespace myDevConst {
  export const APP_NAME: string = 'KyaramitsuManagerDev';
  export const DEFAULT_URL: string = 'https://manage.suijinclub.com/';
  export const LOG_LEVEL: string = 'all';
}

export namespace myAreaConst {
  export const pref: { [key: string]: number } = {
    "北海道": 1,
    "青森県": 2,
    "岩手県": 2,
    "宮城県": 2,
    "秋田県": 2,
    "山形県": 2,
    "福島県": 2,
    "茨城県": 3,
    "栃木県": 3,
    "群馬県": 3,
    "埼玉県": 3,
    "千葉県": 3,
    "東京都": 3,
    "神奈川県": 3,
    "新潟県": 3,
    "富山県": 4,
    "石川県": 4,
    "福井県": 4,
    "山梨県": 4,
    "長野県": 4,
    "岐阜県": 4,
    "静岡県": 4,
    "愛知県": 4,
    "三重県": 5,
    "滋賀県": 5,
    "京都府": 5,
    "大阪府": 5,
    "兵庫県": 5,
    "奈良県": 5,
    "和歌山県": 5,
    "鳥取県": 6,
    "島根県": 6,
    "岡山県": 6,
    "広島県": 6,
    "山口県": 6,
    "徳島県": 6,
    "香川県": 6,
    "愛媛県": 6,
    "高知県": 6,
    "福岡県": 7,
    "佐賀県": 7,
    "長崎県": 7,
    "熊本県": 7,
    "大分県": 7,
    "宮崎県": 7,
    "鹿児島県": 7,
    "沖縄県": 7,
  };
}