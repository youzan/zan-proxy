## 开发及打包相关命令

### 启动开发模式

```shell
yarn run dev
```

开发模式下，会将命令行剩余的参数传递给 electron 进程，可以在 main 进程中通过 `process.argv` 获取

如：`yarn run dev --debug` === `electron . --debug`

### 打包

```shell
yarn run build
```

### renderer 进程打包结果分析

```shell
yarn run analyzer
```
