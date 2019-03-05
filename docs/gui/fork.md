## 如何 fork 一份自己的 zan-proxy-mac

### 初始化仓库并添加远程仓库地址

#### 方案1 — 使用 Github Fork

```
git clone your-fork-git-repo my-zan-proxy-mac
git remote add upstream git@github.com:kainstar/zan-proxy-mac.git

git fetch upstream
git merge upstream/master --allow-unrelated-histories
```

#### 方案2 — 本地创建

```shell
mkdir my-zan-proxy-mac
cd my-zan-proxy-mac
git init
git remote add upstream git@github.com:kainstar/zan-proxy-mac.git
git remote add origin your-remote-git-repo

git pull

git fetch upstream
git merge upstream/master --allow-unrelated-histories
```

### 同步zan-proxy-mac仓库的更新内容

```shell
git fetch upstream
git checkout master # 推荐在同名分支进行同步
git merge upstream/master
```
