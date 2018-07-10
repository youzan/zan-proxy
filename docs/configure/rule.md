# 转发规则

可点击管理页面主菜单上的`Http转发`进行转发规则的管理

<img src="https://img.yzcdn.cn/public_files/2018/04/18/fcf0f039bf43a67f4c37a458adfbcd59.png" />

<img src="https://img.yzcdn.cn/public_files/2018/03/30/3a7f3c2c682180c496f2e748cf05851e.png" />

## 规则导入
可以导入远程规则、本地规则。方便团队之间共享规则文件。导入的`远程规则`会在服务器启动时自动同步。

<img src="https://img.yzcdn.cn/public_files/2018/04/18/3ec2a61d3f982109ccdabb5c5ada18ed.png">

## 规则导出
将规则文件导出，可以放到服务器上，方便别人导入。  

## 规则配置
ZanProxy中一个规则集可对应多个规则，每个规则集和每个规则都可单独配置是否生效。(如a规则在A规则集下，当A规则不生效时，无论a规则是否被勾选，都不生效)。
<img src="https://img.yzcdn.cn/public_files/2018/03/30/3a7f3c2c682180c496f2e748cf05851e.png" />

## 规则编辑
<img src="https://img.yzcdn.cn/public_files/2018/03/30/4e6849fa6536d5c067e7dfb8fe732c6b.png" />

#### 匹配过程

URL特征为该请求是否被ZanProxy所转发的主要判定方式。其判定规则如下：

1. 优先将URL特征当成一个字符去匹配所有请求，当某一请求的url中包含URL特征，则视为该请求符合该URL特征。

2. 当规则1无法匹配时，将该URL特征实例化为一个正则表达式，再对所有请求进行匹配（RegExp.prototype.test方法）。

## 请求动作

请求动作会根据添加顺序依次执行

### 请求动作：转发请求

将请求转发到本地、或者另一个地址

### 请求动作：返回自定义数据

将指定的数据文件返回给浏览器

### 请求动作：增加请求头

增加请求的header，常见的如cookie、user-agent等

### 请求动作：增加响应头

增加服务器响应的header，常见的如access-control-allow-origin

### 进阶

在使用正则写URL特征时，ZanProxy支持在处理类型的转发中写$占位符，用于替换为正则匹配后第N个获取组。

#### 示例

请求url为：https://b.yzcdn.cn/v2/build/wap/showcase/sku_58590c11af.js  
要拦截的请求的url特征为：build/wap/(.*?)_[^_]*$  
请求转发路径为：<%=wapproject%>/js/$1/main.js。  
则最终请求路径中的$1将被替换为showcase/sku

#### 特别注意

在使用正则写URL特征时，ZanProxy在处理时会对完整的请求路径**包括请求参数**进行处理。

请求url为：https://b.yzcdn.cn/v2/build/wap/showcase/sku_58590c11af.js?date=12345

要拦截的请求的url特征为：build/wap/(.*)

请求转发路径为：/my/project/js/$1

则最终实际的转发路径会是：/my/project/js/showcase/sku_58590c11af.js?date=12345

**如需过滤请求参数，请使用正则进行过滤**。上述例子可以把url特征改为：`build/wap/(.*)(?:\?.*)`,
这样实际的转发路径就会变成`/my/project/js/showcase/sku_58590c11af.js`，不再包含请求参数。
