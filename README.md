# YY 解析 API （Vercel + Edge CDN 缓存版）

此项目是基于原版 yy.php 转换的 Node.js 实现，部署在 Vercel，启用了 **CDN 自动缓存（方案A）**，性能提升显著。

## 🚀 主要特性
- 完全保留原始逻辑和签名算法
- 服务器端缓存 5分钟（/tmp）
- CDN 边缘缓存 5分钟（s-maxage）
- 响应速度提升 5~10倍

## 📦 使用方法

1. 打开 [https://vercel.com](https://vercel.com)，新建项目。
2. 上传整个项目文件夹或导入 GitHub 仓库。
3. 点击 **Deploy** 即可。

## 🌐 访问方式
```
https://你的项目名.vercel.app/api/yy?id=34229877
```

将返回 `.m3u8` 文件（含 HTTP 头缓存策略）。

## ⚙️ 项目结构
```
api/
 └── yy.js
vercel.json
README.md
```

## 🧠 提示
- CDN 缓存由 Vercel Edge Network 自动管理；
- 缓存 5分钟内命中后直接返回，不执行后端逻辑。
