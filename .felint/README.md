Felint Config
========

## 说明

`felint-config`必须提供一个`config.js`文件作为`Felint`的功能配置。

以下为一个`config.js`的例子:

```javascript
module.exports = {
    dependence: {
        npm: {
            "eslint": "3.19.0",
            "babel-eslint": "7.2.1",
            "eslint-config-airbnb": "14.1.0",
            "stylelint": "7.10.1",
            "stylelint-config-standard": "16.0.0"
        }
    },
    plan: {
        es6: ['.eslintrc_es6', '.stylelintrc'],
        es5: ['.eslintrc_es5', '.stylelintrc'],
        default: ['.eslintrc_es6', '.stylelintrc']
    },
    initHooks: 'update_git_hooks.sh'
}
```

其中`dependence`指定了`felint`的依赖包。

`plan`字段指定了`Felint`可用的代码规范方案。

**e.g.**

> es6: ['.eslintrc_es6.json', '.stylelintrc.json']
> > 该方案名为es6，使用`felint-config 的 rules目录`下的 .eslintrc_es6.json 和 .stylelintrc.json规范文件。

`initHooks`指定了初始化钩子的脚本，将在执行felint init的时候被调用。

## 配置

### 配置规则文件

请在`rules`目录下加入需要的配置规则文件。

命名方式为`.eslintrc_type.json` `.stylelintrc_type.json`。

### 配置git钩子

增/删/修改hooks目录下的shell文件，然后修改`update_git_hooks`逻辑应用你自己的修改。

### 配置依赖

修改config.js文件内的dependence.npm内容

### 配置规则方案

修改config.js文件内plan字段，key为方案名，一个方案可以对应不同的eslintrc和stylelintrc文件组合
