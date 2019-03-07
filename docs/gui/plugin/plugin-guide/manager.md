## 插件 Manager 开发指南

插件的 main 进程[入口文件](../../../src/gui/plugins/counter/manager/index.ts)导出一个含有 manager 属性的对象，该属性的值是 `BaseManager` 的子类的实例，一个 Manager 的雏形为：

```ts
import { Container, Service } from 'typedi';
import BaseManager from '@gui/main/core/base-manager';

@Service()
class MyManager extends BaseManager {}

export default {
  manager: Container.get(MyManager),
};
```

### 生命周期

每个的 manager 都可以声明生命周期方法，在 Application 运行到对应的阶段时，会尝试调用对应阶段的生命周期方法。在这些生命周期方法中，你可以做添加、取消监听事件，修改内部状态等一系列操作。

目前支持的生命周期函数有：

- `init`: 应用初始化时调用的方法，一般用来执行启动服务，初始化数据，添加事件监听等操作

- `afterInit`: 应用初始化结束后调用的方法，这个生命周期的作用与 init 相似，只是所有 manager 的 init 初始化已经完成

- `destory`: 应用即将关闭时的生命周期，用来释放一些外部资源

上面的生命周期函数，除了 destory 是强制同步以外，其他函数都可以返回一个 `Promise`，Application 会等待这个 Promise resolve 后，再去执行下一个 Manager 的生命周期函数。

### 注入属性

在执行 init 生命周期函数前，Application 会将一些属性添加到 Manager 实例对象上，保证 Manager 在 init 及之后的生命周期中能够访问到这些对象。

被注入的对象属性有：

- application: [`Application`](../api/main.md#Application)

- storage: [`Storage`](../api/main.md#Storage)

- workspaceWindow: [`WorkspaceWindow`](../api/main.md#WorkspaceWindow)

### Manager 间的通信

当你开发插件时，很有可能遇到需要和其他 Manager 进行数据交互，或通知其他 Manager 触发事件、更新数据的场景。如果在一个 Manager 中引入其他的 Manager，将其作为属性来调用其他 Manager 的方法的话，会导致 Manager 之间存在复杂的依赖关系网，维护会变得十分困难，。因此，zan-proxy-mac 选择使用事件的方式来解决 Manager 之间的通信问题。

基本思路是：Manager 通过调用注入的 Application 属性的[事件触发方法](../api/main.md#Application)，告诉 Application 应该触发 Manager 的事件名称和传递的参数，Application 来触发内部管理的所有 Manager 的对应事件，监听了该事件的所有 Manager 的处理方法若是个异步事件，则可以通过返回一个 Promise 的方式来通知 Application 什么时候这个事件处理完毕。所有的 Manager 都通过继承 [emittery](https://github.com/sindresorhus/emittery) 这个异步事件库的方式来为自己添加事件监听功能，从而使 Application 和 Manager 都能轻松地支持和处理异步事件。

相关的示例代码为：

```ts
class Manager1 extends BaseManager {
  public init() {
    this.on('listen1', this.eventHandler);
  }

  eventHandler = () => {
    console.log('application emit manager1\'s listen1 event');
  }
}
```

```ts
class Manager2 extends BaseManager {
  public afterInit() {
    this.application.emitAllManager('listen1');
  }
}
```
