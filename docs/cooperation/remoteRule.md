# 远程规则

`远程规则`是指一个存在于服务器的规则集文件，可以用于团队内规则的共享。

<img src="https://img.yzcdn.cn/public_files/2018/04/28/65f79725d76dd6b09641b30f2046f7fd.png">

## 使用场景

在一个项目开发中，多名开发者往往需要共享一套规则。`ZanProxy`提供了`远程规则`的机制来保证开发者之间规则的一致性。

## 创建远程规则（一般由团队内一个成员创建）

### 新建规则集

<img src="https://img.yzcdn.cn/public_files/2018/05/02/4ba10954e5c049a44367c911dddaf9da.png">

<img src="https://img.yzcdn.cn/public_files/2018/05/02/5ba38808029a85d73dcf55bac9afbcdf.png">

### 导出规则集

<img src="https://img.yzcdn.cn/public_files/2018/05/02/150602d48d748cbd8d8cd98b9494643b.png">

### 上传规则集

将导出的文件文件至服务器上一个可访问的地址，如http://xxxxx.com/myRule.json。 我们内部做法是上传至私有gitlab的一个仓库里。

## 其他成员导入远程规则

<img src="https://img.yzcdn.cn/public_files/2018/05/02/0cab6c496caab67a7085332ab9c83e3b.png">

<img src="https://img.yzcdn.cn/public_files/2018/05/02/b8b03416264bd793b8c9f34663b7fea5.png">

这样就实现了远程规则在团队间的共享了。

**ZanProxy在启动的时候会去同步这个远程规则，所以当远程地址上的文件更新时，规则会自动更新。**