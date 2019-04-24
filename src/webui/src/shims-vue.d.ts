declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

// third lib types
declare module 'vue-data-center' {
  const plugin: any;
  export default plugin;
}

declare module 'element-ui' {
  const ui: any;
  export default ui;
}

declare module 'vue-clipboard2' {
  const plugin: any;
  export default plugin;
}

declare module 'prettytime' {
  interface IOptions {
    decimals: number;
    short: boolean;
  }

  function prettytime(ms: number, options?: Partial<IOptions>): string;
  export default prettytime;
}

declare module "vue/types/vue" {
  interface Vue {
    $message: any;
  }
}
