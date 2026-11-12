# dsh-glass

一套给 [DeepSeek Harness](https://github.com/deepseek-ai)（DSH）桌面版用的界面插件：中性灰配色、半透明悬浮面板、连续曲率圆角、弹性动效，右侧栏换成会话工作台，背后可以养一池 ASCII 锦鲤。

A set of DeepSeek Harness desktop plugins: neutral greys, translucent floating panels, continuous corners, spring motion, a session workbench in the right panel, and an optional ASCII koi pond behind it all.

> 本项目与 Apple、DeepSeek 均无关联。“Apple-style”只是对设计风格的描述。
> Not affiliated with Apple or DeepSeek.

## 插件

| 插件 | 作用 | 依赖 |
|---|---|---|
| [`glass-theme`](glass-theme) | 配色、玻璃、圆角字体、交互动效，四组各自开关。玻璃有“清透 / 标准 / 沉稳”三个预设。开启“折射透镜”后，输入框、顶栏控件和菜单是液态玻璃，聚焦时边缘亮起一道细光，后面有文字经过时玻璃变厚。菜单和弹窗从按钮里长出、关闭时收回，途中可以打断。冷启动时鲸鱼飞进首页标题，发送第一条消息和回到首页也有连贯的过渡。设置页会自检 DSH 的界面结构 | — |
| [`workbench`](workbench) | 右侧栏开始页换成工作台：状态、上下文、改动、任务、子智能体、工具。改动按轮保存、重启后还在，可以就地看差异，也可以回退到任意一轮之前并撤销；记住右栏宽度；把输入框下方的状态行和任务条收进来 | — |
| [`koi-pond`](koi-pond) | 背景 ASCII 锦鲤，可单独开关；首页鱼清晰，文字下自动变淡。发送第一条消息时水波从输入框四周荡开，打字时鱼从输入框下游开 | 建议配 `glass-theme` |
| [`turn-alert`](turn-alert) | 窗口不在前台时，回合结束弹桌面通知 | — |
| [`turn-resume`](turn-resume) | 回合被中断后，在输入框下出现“继续”胶囊 | — |

整套效果推荐全部安装。`turn-alert` 和 `turn-resume` 都可以单独安装。

## 安装

在 DSH 里打开 **插件 → 添加插件 → 安装第三方插件**，每次填一个：

```
github:Tal-Shin/dsh-glass#path:/glass-theme
github:Tal-Shin/dsh-glass#path:/workbench
github:Tal-Shin/dsh-glass#path:/koi-pond
github:Tal-Shin/dsh-glass#path:/turn-alert
github:Tal-Shin/dsh-glass#path:/turn-resume
```

也可以把仓库克隆到本地，填各插件文件夹的绝对路径安装。

**建议同时调整**：设置 → 通用设置里把正文字号调到 15、代码字号调到 13。

**更新**：用 `github:` 地址装的插件不能在插件页直接更新。要换新版，先在插件页删除，再用上面的地址重新安装。

**从带有独立启动页的版本升级**时，请先在插件页删除 `boot-veil`，再安装新版 `glass-theme`。从 `v1.2.0` 起，鲸鱼启动画面由主题提供。

**从 0.1.x 升级**：`liquid-glass`、`cupertino`、`pond-polish` 已并入 `glass-theme`。先在插件页删除这三个插件，其余插件按上面的方法删除后重新安装。之前在 `liquid-glass` 里保存的设置不会自动带过来，需要重新调一次。忘了删的话，`glass-theme` 设置页的“兼容性”会提示。

**装好后重启一次 DSH**：`workbench` 的改动记录在 Host 端运行，重启后才开始记录。

## 兼容性

- 在 DSH 0.2.2-rc.1（Windows 11、Electron 44）上测试过；全新安装与从 0.1.1 升级的测试做于 v1.0.0。更早的 DSH 没有重新测试，macOS、Linux 未测试。
- 动效跟随系统的“减弱动态效果”：只保留淡入淡出，不再移动和缩放，锦鲤静止。开启系统的“增强对比度”后，玻璃变得接近不透明，边缘清晰可见。
- 开机过渡只在冷启动时完整播放；刷新页面只淡出启动画面。启动画面最前面那一段是 DSH 自带的加载卡，插件改不到。
- 部分样式依赖外壳内部的类名，类名变了时对应的地方会退回 DSH 自带的实色；`workbench` 用到了未公开的布局接口。DSH 升级后可能需要适配：`glass-theme` 设置页的“兼容性”会列出对不上的地方。
- 折射透镜依赖 Chromium 的 `backdrop-filter` 支持 SVG 滤镜，桌面版可用，默认关闭。
- `workbench` 只记录文件工具（写入、编辑、补丁）做的改动，命令行做的改动不显示也不回退；回退后 AI 并不知道，继续对话时可以告诉它。
- 按标签固定版本安装子目录（`#v1.0.0&path:/…`）在 DSH 自带的 pnpm 11 下不可用，安装总是跟随 main。
- 长会话的轨迹页滚动偏慢，主要来自 DSH 自身，开启外观后会再慢一些。
- `glass-theme` 与其他主题插件同时启用会互相覆盖，只保留一个主题。

## 维护

DSH 每次更新后，带调试端口启动它，打开一个对话，再运行冒烟测试：

```
"%LOCALAPPDATA%\Programs\DeepSeek Harness\DeepSeek Harness.exe" --remote-debugging-port=9333
node tools/smoke.mjs            # 只读检查
node tools/smoke.mjs --scroll   # 另外测滚动帧率
```

## 卸载

在 **插件** 页删除对应插件即可，界面会恢复原样。`workbench` 删除后，输入框下的状态行和任务条会回来。

## 致谢与许可

- `glass-theme` 与 `koi-pond` 部分代码改编自 cngtn 的 [dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond)，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- 其余代码以 [MIT](LICENSE) 许可发布。
