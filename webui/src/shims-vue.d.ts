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
