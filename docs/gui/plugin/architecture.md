## 项目架构

![架构图](https://img.yzcdn.cn/public_files/2019/03/07/47150417c448047323f27f470942b572.jpg)

上面是一张简单的 zan-proxy-mac 架构图，可以看出，zan-proxy-mac 以 Application 类为核心，管理多个 Manager，每个 Manager 都拥有 Storage、WorkspaceWindow 这些被注入的属性，下面将对各个类的职责做一下简单的介绍。

### Application

Application 类是 zan-proxy-mac 的核心，也是应用的入口。这个类负责加载插件，管理应用中的所有 Manager，拥有调用 Manager 的生命周期方法，为 Manager 注入外部属性，统一触发 Manager 监听事件等功能。

### Manager

Manager 类是 zan-proxy-mac 的功能承载主体，所有与应用功能相关的逻辑都被分散封装在多个不同的 Manager 内，包括工作区预设切换、Tray 菜单渲染、预安装插件、Renderer 进程插件加载等。

Manager 自身也是一个异步的 EventEmitter，通过监听和触发对应的事件来实现不同 Manager 之间的数据传输通讯，同时各个 Manager 也负责与 Renderer 进程的相关 Ipc 信道进行数据传输和处理。

### Storage

Storage 是一个本地数据存储中心，各个 Manager 通过调用 Storage，将自己的一些数据保存到本地，以便在下次打开应用时从本地恢复相关数据。

### WorkspaceWindow

WorkspaceWindow 控制 Renderer 进程窗口，各个 Manager 通过它可以直接给 Renderer 进程发送信息。

### Utils/ipc

上面提到的通过 WorkspaceWindow 直接给 Renderer 进程发送信息的方式只是用在一些需要 Main 进程主动给 Renderer 进程推送消息的场合。

一般情况下，由 Renderer 进程向 Main 进程发送消息的情况更为多见，这种情况与一般 web 应用中的 Ajax 请求比较相似，因此 zan-proxy-mac 为 Main 进程和 Renderer 进程都封装了相应的方法，用来将 Ipc 通讯模拟为一个 Ajax 请求。
