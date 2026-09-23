## 选择你的安装包

| 电脑 | 下载文件 | 安装方式 |
| --- | --- | --- |
| Mac · Apple Silicon · macOS 13+ | [下载 macOS 安装包（.dmg）](https://github.com/Simple-Alone/TO-DO-Panel/releases/download/v1.2.0/Dynamic-Panel-1.2.0-arm64.dmg) | 打开 DMG，将应用拖入「应用程序」 |
| Windows 10/11 · Intel / AMD 64 位（x64） | [下载 Windows 安装包（.exe）](https://github.com/Simple-Alone/TO-DO-Panel/releases/download/v1.2.0/Dynamic-Panel-1.2.0-windows-x64-setup.exe) | 双击 EXE，按安装向导完成安装 |

Release 同时提供两个安装包对应的 `.sha256` 完整性校验文件。

## 1.2.0

- 新增可选的自托管同步服务：支持多账号和空间、增量同步、冲突处理、PNG 对象传输、加密备份与恢复；桌面端默认仍保持本地优先。
- 新增截图标注、整屏／窗口／区域录屏、录制状态控制条和统一全局快捷键设置，完善 Windows 捕获后备路径与媒体资源释放。
- 新增金融观察页和可配置数据源，覆盖加密市场、美股与 A 股；AI 解读只使用用户主动提交的当前行情快照。
- 重构首页、AI 对话和长回答工作台，增加显式资料选择、会话保存、安全 Markdown、重试、笔记保存与待办提取。
- 扩展应用内音乐播放器，支持本地文件、公开 HTTPS 音频和本机 go-music-dl 歌单，并修复 macOS 曲目切换状态竞争。
- 完善启动器、笔记分类标签、链接管理、跨显示器定位和 Windows 安装验证；macOS 与 Windows 构建均通过 GitHub Actions 验证。

## 首次安装

Mac 采用 ad-hoc 签名，不进行 Apple 公证。若首次被系统拦截，打开「系统设置 → 隐私与安全性」并点击「仍要打开」。

Windows 安装包目前没有商业代码签名，首次运行可能显示「Windows 已保护你的电脑」。请确认来自本仓库 Release 并核对校验码，再通过「更多信息 → 仍要运行」继续。安装在当前用户目录，无需管理员权限。受组织策略管理的电脑可能需要管理员批准。

Windows 使用 GitHub 托管 runner 验证安装、程序启动、核心 IPC、系统加密、快捷键、录音／摄像头模拟设备生命周期、重新安装数据保留与卸载。物理摄像头／麦克风、Windows 10 实机、多显示器硬件与特定安全软件不属于此次自动测试覆盖范围。
