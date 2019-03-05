## 类型系统

zan-proxy-mac 声明了一个命名空间 —— `ZanProxyMac`，除了全局属性和一些通用类型外，所有的类型都被声明在这个命名空间内。

tsconfig.json 指定了类型文件的目录为:

```json
{
  "typeRoots": [
    "./src/gui/types",
    "./src/gui/main/managers",
    "./src/gui/plugins"
  ]
}
```

TypeScript 在编译时，会将对应目录下的所有同名类型进行合并。因此，我们可以通过将不同 Manager 相关类型的字段写在不同的文件中的方式，使得类型的扩展和管理更加方便。zan-proxy-mac 的 Manager 事件名称提示功能也是依赖这个功能实现的。

### 编写方式

需要扩展或新增某个类型时，需要在相关的目录下创建一个 `*.d.ts`文件，该文件需要声明 namespace 为 `ZanProxyMac`，同时在该 namespace 内编写对应的类型：

```ts
declare namespace ZanProxyMac {
  // 你要声明或扩展的类型
  interface INewType {}
}
```

之后，就可以在其他文件中用 `ZanProxyMac.INewType` 的方式来访问你所声明的类型或扩展的类型字段了。

### 常用类型介绍

下面介绍开发时经常会用到或需要扩展的一些类型（这里指的所有类型都是在 ZanProxyMac 的 namespace 中的）：

- `interface IStorageStore`: Storage 的存储值类型，目前该类型的类型检查功能不是很好，没有对 set 方法调用的传参进行类型检查。

- `interface IDataEventMap`: 有传值的事件类型，key 为事件的名称，value 为触发事件时传递的值的类型（仅有一个，不支持多个值的传递）。

- `interface IEmptyEventMap`: 无传值的事件类型，key 为事件的名称，value 固定为 `void`。

- `interface IManagerGroup`: 所有 manager 的集合，扩展该类型后，可在 application 的 `emitOneManager` 和 `emitOneManagerSerial` 方法中获取相应的 manager 的名称。

- `interface IWorkspace`: 工作区预设的对象类型，若要在自定义插件中扩展 workspace 对象，则需要先扩展该对象。

- `interface IExportOrImportData`: 工作区导出和导入时的数据对象类型，用于扩展在导出和导入工作区预设时得到的事件传递指的对象

