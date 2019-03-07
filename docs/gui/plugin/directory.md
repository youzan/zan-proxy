## 目录结构

本文档只介绍部分对插件开发者来说需要了解的目录结构及相关文件。

**注意：不推荐开发者对 `src/gui` 目录中 `config.ts` 和 `plugins` 以外的文件进行修改，可能会在后续合并代码时产生冲突。**

```shell
root
├── package.json
├── icons             # 图标文文件夹
├── resources         # extraResources 外部资源文件夹
├── src/gui
│   ├── config.ts     # 配置文件
│   ├── global.d.ts   # 全局类型声明
│   ├── common        # main进程与renderer进程公用文件目录
│   ├── main          # main 进程目录
│   │   ├── core
│   │   ├── managers  # 内置 Manager
│   │   ├── dev.ts    # main 进程开发模式额外加载的文件
│   │   ├── index.ts  # main 进程入口文件
│   │   ├── main.ts
│   │   └── utils     # main 进程工具函数目录
│   ├── renderer      # renderer 进程目录
│   │   ├── api
│   │   ├── components
│   │   ├── store     # renderer 进程 mobx store 目录
│   │   └── utils     # renderer 进程工具函数目录
│   ├── plugins       # 自定义插件目录
│   └── types         # 公共类型目录
├── static            # 静态资源目录
├── dist
└── build
```

#### src/gui/config.ts

统一的配置文件，导出的对象会被 `src/main/main.ts` 文件使用，用于初始化应用。

可导出的对象有：

- plugins: `string[]` —— 程序运行时需要加载的插件的根目录数组

#### src/gui/global.d.ts

声明各种全局的类型，包括通用类型、 main 进程 global 扩展类型和 renderer 进程 window 扩展类型

#### src/gui/common

main 进程和 renderer 进程公共目录，一般存放一些公共数据（如公共常量、通讯信道名称等）

#### src/gui/types

main 进程和 renderer 进程的类型文件，该目录的所有类型都在 `ZanProxyMac` 这个命名空间下

#### src/gui/main

该目录为 electron main 进程目录，该目录下有：

1. `index.ts`: 入口文件，`index.ts` 会根据运行环境计算声明一些全局变量，然后加载 `main.ts` 文件，若处于开发环境，则在加载 `main.ts` 之前，还会加载 `dev.ts`.

2. `dev.ts`: 开发环境额外加载的文件，用来引入一些开发模式需要额外加载的第三方库（例如各种devtool）

3. `main.ts`: 实际的应用启动入口，调用应用的加载插件和初始化方法

4. `core`: 该目录下存放了 main 进程执行的核心模块文件，具体内容请参考[API文档](./api/main.md#core)

5. `managers`: 该目录下存放了 zan-proxy-mac 内置的 manager 及相关的定义

6. `utils`: 该目录下存放了 main 进程中的工具函数，具体内容请参考[API文档](./api/main.md#utils)

#### src/gui/renderer

electron 渲染进程，webpack 打包后生成 vendor.js 和 renderer.js 两个文件（不包括插件的 renderer 进程代码）

1. `main.tsx`: 打包入口文件

2. `store`: 该目录下存放了 renderer 进程中状态管理库 mobx 的所有 store，具体内容请参考[API文档](./api/renderer.md#store)

3. `utils`: 该目录下存放了 renderer 进程中的工具函数，具体内容请参考[API文档](./api/renderer.md#utils)

#### static

静态文件目录，该目录会在打包时被打包进 asar 文件中，因此你可以使用全局变量 `global.__static`（main 进程）或 `window.__static`（renderer 进程）来访问该目录

#### resources

外部资源目录，该目录不会在打包时被打包进 asar 文件中，可以通过 `global.__resource` 来访问

#### dist

存放代码打包后输出文件的目录

**注意：** 开发模式下只会将 main 进程相关代码输出到该目录下，而 renderer 进程的代码会存放在 webpack-dev-server 中

#### build

存放 electron-builder 打包后结果文件的目录
