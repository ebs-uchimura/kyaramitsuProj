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
  export const APP_NAME: string = 'Kyaramitsu';
  export const DEFAULT_URL: string = 'https://kyaramitsu.ebisu-do.jp/';
  export const LOG_LEVEL: string = 'debug';
}

export namespace myDevConst {
  export const APP_NAME: string = 'KyaramitsuDev';
  export const DEFAULT_URL: string = 'https://dev.suijinclub.com/shop';
  export const LOG_LEVEL: string = 'all';
}
