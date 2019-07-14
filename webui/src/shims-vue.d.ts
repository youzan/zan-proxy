declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

// third lib types

declare module 'vue-json-tree' {
  const component: any;
  export default component;
}

declare module 'vue-clipboard2' {
  const plugin: any;
  export default plugin;
}

declare module 'qrcode-js' {
  const content: any;
  export default content;
}

declare module 'prettytime' {
  interface IOptions {
    decimals: number;
    short: boolean;
  }

  function prettytime(ms: number, options?: Partial<IOptions>): string;
  export default prettytime;
}
