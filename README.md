# dsh-glass

一套给 [DeepSeek Harness](https://github.com/deepseek-ai)（DSH）桌面版用的界面插件：中性灰配色、半透明悬浮面板、连续曲率圆角、弹性动效，右侧栏换成会话工作台，背后可以养一池 ASCII 锦鲤。

A set of DeepSeek Harness desktop plugins: neutral greys, translucent floating panels, continuous corners, spring motion, a session workbench in the right panel, and an optional ASCII koi pond behind it all.

> 本项目与 Apple、DeepSeek 均无关联。“Apple-style”只是对设计风格的描述。
> Not affiliated with Apple or DeepSeek.

## 插件

| 插件 | 作用 | 依赖 |
|---|---|---|
| [`glass-theme`](glass-theme) | 配色、透明外壳、悬浮卡片、渐变背景、阅读排版 | — |
| [`liquid-glass`](liquid-glass) | 面板、输入框和菜单的玻璃材质与高光 | `glass-theme` |
| [`cupertino`](cupertino) | 圆角阶梯、阴影、字体栈、分段滑块、开关和弹簧曲线 | — |
| [`pond-polish`](pond-polish) | 文字对比度、按下反馈、菜单和弹窗弹入 | 建议配 `cupertino` |
| [`workbench`](workbench) | 右侧栏开始页换成工作台：状态、上下文、改动、任务、子智能体、工具；记住右栏宽度；把输入框下方的状态行和任务条收进来 | — |
| [`koi-pond`](koi-pond) | 背景 ASCII 锦鲤，可单独开关；首页鱼清晰，文字下自动变淡 | 建议配 `glass-theme` |
| [`boot-veil`](boot-veil) | 启动画面：应用图标和细进度条，按明暗模式显示 | — |
| [`turn-alert`](turn-alert) | 窗口不在前台时，回合结束弹桌面通知 | — |
| [`turn-resume`](turn-resume) | 回合被中断后，在输入框下出现“继续”胶囊 | — |

整套效果推荐全部安装；`turn-alert`、`turn-resume`、`boot-veil` 可以单独用。

## 安装

在 DSH 里打开 **插件 → 添加插件 → 安装第三方插件**，每次填一个：

```
github:Tal-Shin/dsh-glass#path:/glass-theme
github:Tal-Shin/dsh-glass#path:/liquid-glass
github:Tal-Shin/dsh-glass#path:/cupertino
github:Tal-Shin/dsh-glass#path:/pond-polish
github:Tal-Shin/dsh-glass#path:/workbench
github:Tal-Shin/dsh-glass#path:/koi-pond
github:Tal-Shin/dsh-glass#path:/boot-veil
github:Tal-Shin/dsh-glass#path:/turn-alert
github:Tal-Shin/dsh-glass#path:/turn-resume
```

也可以把仓库克隆到本地，填各插件文件夹的绝对路径安装。

**顺序**：先装 `glass-theme`，再装 `liquid-glass`。

**建议同时调整**：设置 → 通用设置里把正文字号调到 15、代码字号调到 13。

## 兼容性

- 在 DSH 0.2.1-rc.5 和 0.2.2-rc.1（Windows 11、Electron 44）上测试过，macOS、Linux 未测试。
- 部分样式依赖外壳内部的类名，`workbench` 用到了未公开的布局接口，DSH 升级后可能需要适配。
- `glass-theme` 与其他主题插件同时启用会互相覆盖，只保留一个主题。

## 卸载

在 **插件** 页删除对应插件即可，界面会恢复原样。`workbench` 删除后，输入框下的状态行和任务条会回来。

## 致谢与许可

- `glass-theme` 与 `koi-pond` 部分代码改编自 cngtn 的 [dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond)，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- 其余代码以 [MIT](LICENSE) 许可发布。
