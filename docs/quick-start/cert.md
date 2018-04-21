# 证书安装

代理https请求需要本地安装一个证书。

## Mac上安装证书

### 下载证书

在ZanProxy管理界面首页，点击证书下载链接下载根证书，如下图
<img src="https://img.yzcdn.cn/public_files/2018/03/30/ba92c5f30709ff07aa323f773c6a4836.png" />

### 安装证书

打开钥匙串应用(可在spotlight中直接搜索钥匙串)

<img src="https://img.yzcdn.cn/public_files/2018/04/11/6eb4c9ca084452e24e2a2a9cffe4f5a6.png" width="500" />

### 证书信任

1. 打开钥匙串应用(可在spotlight中直接搜索钥匙串),找到名称为zProxy的证书

<img src="https://img.yzcdn.cn/public_files/2018/04/11/b3213bee49dd6771f4df1dc0a84453ad.png" width="500" />

2. 将其权限改为信任

<img src="https://img.yzcdn.cn/public_files/2018/04/11/ef5edb8bf79504797279e71e3348a058.png" width="500" />

## ios、android上安装证书

1.下载证书
在ZanProxy管理界面首页，通过手机上的扫码软件扫描如下图的二位码获得证书下载链接，然后选择用系统自带的浏览器打开链接（ios下系统自带的浏览器是safari, Android需要自己判断），会自动下载证书.

<img src="https://img.yzcdn.cn/public_files/2018/04/11/7e993fed96c9af51aec68257f1259855.png" width="500" />

2.安装并信任证书
*系统自带的浏览器打开证书链接后会自动下载、进入安装界面。
*android种类繁多，安装和信任证书没有统一的步骤，请按照界面提示操作。
*iso下，在安装界面上点Install后，按照提示进行操作。

** 注：iOS 10.3以上的系统在安装根证书后，需要进入Settings > General > About > Certificate Trust Testings里面进行证书信任，新安装的根证书才生效。信任界面如下图：

<img src="https://img.yzcdn.cn/public_files/2018/04/18/5ee4efa065596389eda0b5443ce63767.png" width="300" />
