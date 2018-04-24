# WebSocket Mock
## 原理
* 调试界面和proxy建立调试会话
* proxy拦截到web socket请求时，检查是否有对此连接感兴趣的调试会话。
* 若没有，则直接将ws连接到目标服务器。
* 若有，则proxy将ws链接和感兴趣的一个调试会话建立管理
* 用户可以通过调试会话将ws发送消息，ws发出的消息显示在调试会话窗口中。

## 创建调试会话
<img src="./img/window.png" width="500" />