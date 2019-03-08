## Main 进程 API 参考文档

### 全局变量

`global` 下挂载了三个全局变量：

1. isDev，用于判断是否是开发模式
2. __static，指向 static 静态资源目录
3. __resource，指向 resource 外部资源目录

### Application

引入方法: 无需引入，Application 自动注入到 Manager 中。

- `plugins`: 插件列表，包含内置插件（即各种内置的 Manager）和外部加载的插件。

- `emitOneManager`: 触发某个 manager 的监听事件

- `emitOneManagerSerial`: 触发某个 manager 的监听事件，并按序执行

- `emitAllManager`: 触发所有 manager 的某个监听事件

- `emitAllManagerSerial`: 触发所有 manager 的某个监听事件，并按序执行

**注意：** 触发事件的方法都是按内部存储的 manager 信息来依次触发各个 manager 的事件的，当一个 manager 对某个事件添加了多个处理函数时，非 Serial 函数会同时触发并等待所有处理函数完成，而 Serial 函数会依次等待处理函数完成

### BaseManager

引入方法:

```ts
import BaseManager from '@gui/main/core/base-manager';
```

所有 Manager 的继承父类，是一个继承了 Emittery.Typed 的 abstract 类，自身没有提供任何 API。

### Storage

引入方法: 无需引入，Application 自动注入到 Manager 中。

Storage 类继承自 [`electron-store`](https://github.com/sindresorhus/electron-store)，除指定类型外没有做其他修改，具体 API 请参考相关文档。

### WorkspaceWindow

引入方法: 无需引入，Application 自动注入到 Manager 中。

WorkspaceWindow 用于控制 Renderer 进程窗口的开启的信息发送

- `open`: 打开 Renderer 进程窗口

- `send`: `(channel: string, ...args: any[]) => void`，向当前窗口发送一个信道信息，若窗口未被打开，则不会发送消息。

### Utils

- `setIpcReplier`: `(channel: string, handler: (...args: any[]) => any): () => void`

引入方法:

```ts
import { setIpcReplier } from '@gui/main/utils';
```

对应 [`ipcSend`](./renderer.md#ipcSend) 的 Main 进程端处理函数的设置函数，该处理函数的正常返回值会被 `ipcSend` 当做成功响应 resolve，若处理函数中 throw 了一个 Error，`ipcSend` 则会 reject 这个 error 的 message.

注意：`ipcSend` 和 `setIpcReplier` 必须一一对应，不允许  `setIpcReplier` 对同一个 channel 信道设置多个处理函数。

### Events

事件的命名规则一般为：`manager名称[.特殊标识]:事件名称`

| 事件名称 | 参数类型 | 作用 | 触发 or 监听 |
| :------ | :------ | :-- | ---------- |
| app-data:update-state | [IState](../../../src/gui/main/managers/app-data/index.d.ts) | 更新应用状态（在 afterInit 生命周期中取消监听）| 触发 |
| host-and-rule-files:update-host | [IHostFile[]](../../../src/gui/main/managers/host-and-rule-files/index.d.ts) | 更新 host 信息 | 监听 |
| host-and-rule-files:update-rule | [IRuleFile[]](../../../src/gui/main/managers/host-and-rule-files/index.d.ts) | 更新转发规则信息 | 监听 |
| tray:get-options | MenuItemConstructorOptions[] | 获取 Tray 菜单展示项信息 | 监听 |
| tray:render | void | 触发 Tray 菜单重新渲染 | 触发 |
| zan-porxy-plugin.constructor:get-pre-install-plugins | [IPluginPkg[]](../../../src/gui/main/managers/zan-proxy-plugin/index.d.ts) | 需要在构造函数中监听该事件，用于获取预安装的 zan-proxy 插件 | 监听 |
| workspace:create | [Partial\<IWorkspace\>](../../../src/gui/main/managers/workspace/index.d.ts) | 创建一个新的工作区预设时，设置这个工作区的默认属性 | 监听 |
| workspace:activate | [IWorkspace](../../../src/gui/main/managers/workspace/index.d.ts) | 启用某个工作区时的处理事件 | 监听 |
| workspace:deactivate | [IWorkspace](../../../src/gui/main/managers/workspace/index.d.ts) | 停用某个工作区时的处理事件 | 监听 |
| workspace:update-list | [IWorkspace[]](../../../src/gui/main/managers/workspace/index.d.ts) | 工作区列表更新时的处理事件，保存、删除、复制工作区都会触发这个事件 | 监听 |
| workspace:export | [IExportOrImportData](../../../src/gui/main/managers/workspace/index.d.ts) | 导出工作区时，扩展导出的文件内容 | 监听 |
| workspace:import | [IExportOrImportData](../../../src/gui/main/managers/workspace/index.d.ts) | 导入工作区时，解析插件扩展部分的文件内容 | 监听 |
