## 插件 Renderer 开发指南

插件的 Renderer 进程[入口文件](../../../src/gui/plugins/counter/renderer/index.ts)通过将 `window.__plugins` 的对应插件名称的属性的值设置为一个对象，来告知应用这个插件在 Renderer 进程上提供的能力。

```ts
import init from './init';
import EditorField from './components/editor-field';

window.__plugins.xxx = {
  init,
  components: {
    EditorField,
  },
};
```

### 挂载对象结构

挂载对象的结构为:

```ts
interface IRendererPluginExport {
  init?: () => void;
  components?: {
    EditorField?: React.ComponentClass<{}>;
  };
}
```

其中，`init` 为这个插件的初始化生命周期函数，在一次 Renderer 进程页面加载中只会执行一次，在执行完所有插件的 init 生命周期函数后，就会渲染插件提供的自定义组件。

`components` 表示这个插件提供的自定义组件，对应的 key 表示了这个组件会在什么地方被渲染，目前只支持在编辑区域渲染自定义的组件。

zan-proxy-mac 的 Renderer 进程不会给这个自定义组件传递任何 props，因此，若想获取到当前工作区的信息，则需要使用 Mobx 来将对应的 store 注入，在这里值展示一个简单的组件代码，具体的 store 和相关的函数请参考[API文档](../api/renderer.md)。

```tsx
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Stores, WorkspaceStore } from '@gui/renderer/store';

interface IProps {
  workspaceStore: WorkspaceStore;
}

@inject<Stores, {}, {}, {}>(({ workspaceStore }) => ({ workspaceStore }))
@observer
class MyEditorField extends React.Component<IProps> {
  public render() {
    const { workspaceStore } = this.props;
    return (
      <div className="editor-field">
        当前工作区为: {workspaceStore.currentWorkspace.name}。
      </div>
    );
  }
}

export default MyEditorField as React.ComponentClass<{}>;
```

### 原理说明

在通过 webpack 打包 Renderer 进程文件时，会扫描 plugins 目录下的所有插件目录，若有 `index.ts` 这个文件，则会将这个文件当做插件的 Renderer 进程入口文件一起打包，生成的结果文件会被 `WebapckHtmlPlugin` 注入到生成的 html 文件中，并放置在 renderer.js 之前。

之后，在 Mobx 的 PluginStore 被初始化时，会从主进程获取当前启用的插件名称列表，通过遍历这个列表，调用所有在 `__plugins` 上挂载的同名插件的生命周期函数，并渲染插件提供的React组件。
