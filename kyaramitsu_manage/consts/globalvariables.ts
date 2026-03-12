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
