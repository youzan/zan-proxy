# 工程路径

配置工程名，和工程目录在本地的绝对路径。
工程名只能是连续的英文字符。
在配置转发规则时，可以通过<%=projectName%>引用工程对应的路径，就可以把请求转发到本地

可点击管理页面主菜单上的`工程路径配置`进行工程路径的管理。

<img src="https://img.yzcdn.cn/public_files/2018/04/18/f7178da6a4b6ce1132feaf761d600687.png">

## 示例：

### 工程路径配置：

<img src="https://img.yzcdn.cn/public_files/2018/03/30/9d89bc857e71bbb747df12e1872b5d76.png" />

### 转发配置：

<img src="https://img.yzcdn.cn/public_files/2018/03/30/6c15d8b078542bb9afbad375aefb866c.png" />

这样通过代理请求线上文件myfile.json的时候，响应的内容就会变成/path/to/myproject/myfile.json的内容。