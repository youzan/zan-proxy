declare namespace ZanProxyMac {
  interface IRendererPluginExport {
    init?: () => void;
    components?: {
      EditorField?: React.ComponentClass<{}>;
    };
  }

  interface IManagerGroup {
    'renderer-loader': void;
  }
}
