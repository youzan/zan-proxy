## 插件的目录

我们先来看一个 Counter 插件的目录结构

```shell
src/plugins/counter
├── index.d.ts          # 该插件的类型定义扩展（必需）
├── common              # 插件的 main 进程和 renderer 进程公用文件（可选）
│   └── constants.ts
├── manager             # 插件的 main 进程目录（必需）
│   └── index.ts        # 插件的 main 进程入口文件
└── renderer            # 插件的 renderer 进程目录（可选）
    ├── api.ts
    ├── components
    │   └── editor-field
    │       └── index.tsx
    ├── index.ts        # 插件的 renderer 进程入口文件
    └── init.ts
```

可以看出，一个 zan-proxy-mac 插件的构成分为 类型定义、manager、renderer 三个部分，其中类型定义和 manager 为为必须的，而如果不需要对 renderer 进程的页面内容进行扩展，则不需要创建 renderer 目录。

### 插件的名称

zan-proxy-mac 将插件所在的目录名称当做插件的名称，因此在类型定义中声明 manager 和在插件的 renderer 中设置挂载对象名称（参考[插件的Renderer介绍](./renderer.md#挂载对象)）时，需要以目录名为准。

### 如何启用或停用插件

插件的启用和停用是由 `config.ts` 文件中 export 的 plugins 对象来控制的，若想要启动插件，则只需要将插件名称添加到 plugins 对象中即可；反之，将插件名称从 plugins 对象中删去，即可停用该插件。

### 编写插件内容

1. [Plugin-Manager 编写指南](./manager.md)
1. [Plugin-Renderer 编写指南](./renderer.md)
