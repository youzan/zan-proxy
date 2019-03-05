type MayExistProp<Obj, Key> = Key extends keyof Obj ? Obj[Key] : void;

// main
declare namespace NodeJS {
  declare interface Global {
    __root: string;
    __site: string;
  }
}

const __root: string;
const __site: string;
