type MayExistProp<Obj, Key> = Key extends keyof Obj ? Obj[Key] : void;

// main
declare namespace NodeJS {
  declare interface Global {
    __root: string;
    __site: string;
    __static: string;
    __resource: string;
  }
}

// renderer
declare module '*.m.scss' {
  const content: { [className: string]: string };
  export default content;
}

interface Window {
  __plugins: {
    [name: string]: ZanProxyMac.IRendererPluginExport;
  };
  __static: string;
}

