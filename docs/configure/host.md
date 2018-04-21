# Host管理

可点击管理页面主菜单上的`Host管理`进行Host文件的管理。

<img src="https://img.yzcdn.cn/public_files/2018/04/18/7c182e87331c2300edc23fe707a74024.png" />

## 新建host

在host管理页点击新增host文件即可新增一个host文件。

<img src="https://img.yzcdn.cn/public_files/2018/03/30/7d7c99d038cdf564e5f1c42ec55b3875.png" />

## 修改单个host
在host列表页面中点击需要修改的host文件的修改按钮(小铅笔)，即可打开编辑页面。
在该编译页面中可以新增和修改host条目。  
host规则支持简单的*号匹配。(注意，目前仅支持在规则头部出现*号)。  
当出现 *.youzan.com和h5.youzan.com时，如果一个请求同时匹配两者(比如h5.youzan.com)，则优先级是h5.youzan.com > *.youzan.com。

<img src="https://img.yzcdn.cn/public_files/2018/03/30/d2073f919501256b0a1cf2d9ca292dc9.png" />

## 跟系统host文件的关系

该host文件系统仅为ZanProxy内部维护的host列表，跟系统host文件可以共存。
即通过zproxy的请求优先匹配内部host列表，再走系统host文件。
