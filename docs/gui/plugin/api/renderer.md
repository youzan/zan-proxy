## Renderer 进程 API 参考文档

### 全局变量

`window`下挂载了两个全局变量：

1. __static，指向 static 静态资源目录
2. __plugins，用来存储插件在 renderer 进程中被需要被调用的各种函数和组件

### Store

#### WorkspaceStore

WorkspaceStore 中存储了与工作区有关的一些信息和方法，是最常用的 store。

引入方法:

```ts
import { WorkspaceStore } from '@gui/renderer/store';
```

- `workspaces: ZanProxyMac.IWorkspace[]`: 工作区的列表数组，包括了所有可用的工作区信息

- `currentWorkspace: ZanProxyMac.IWorkspace`: 当前在右侧显示的正在编辑的工作区信息，注意在这个对象上进行修改时，不会立刻同步到 workspaces 属性中，只有在保存后，信息才会被同步。

- `activatedWorkspace: ZanProxyMac.IWorkspace`: 当前被激活，即正在使用的工作区的信息

- `setCurrentWorkspaceAttrs: (attrs: Partial<ZanProxyMac.IWorkspace>) => void`: 接收一个对象，用来设置当前工作区的属性。

### Utils

- `ipcSend`: `<R = any> (channel: string, ...reqArgs) => Promise<R>`

  引入方法:

  ```ts
  import { ipcSend } from '@gui/renderer/utils';
  ```

  模拟 Ajax 与 Main 进程进行通信的封装函数，接收参数与 ipcRenderer.send 相同，返回一个 Promise，该 Promise 会等待 Main 进程中 `setIpcReplier` 设置的对应信道的处理函数执行完毕后 resolve 或 reject。
