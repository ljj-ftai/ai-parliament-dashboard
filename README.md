# 🏢 Pixel Office - AI 像素监控办公室

基于 Pixel Agents 概念的可视化监控平台，将 OpenClaw Agent 状态映射为像素小人的动作。

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 功能特性

- 🎮 **像素风格可视化** - Agent 状态变成办公室里的像素小人
- 📊 **实时监控** - 3秒自动轮询，即时反映 Agent 状态
- 🏢 **多区域划分** - 代码区、搜索区、写作区、休息区
- 🎯 **状态显示** - 运行中、思考中、待命、出错
- 🐳 **Docker 部署** - 一键部署到云端

## 🚀 快速开始

### 本地开发

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端 (新终端)
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### Docker 部署

```bash
docker-compose up -d
```

访问 http://localhost:3000

## 📱 功能说明

### 区域划分

| 区域 | 描述 | Agent 类型 |
|------|------|-----------|
| 💻 代码区 | 编写代码的工位 | backend, frontend, devops |
| 🔍 搜索区 | 查阅资料的区域 | orchestrator, qa |
| ✍️ 写作区 | 撰写报告的区域 | reporter |
| ☕ 休息区 | 待命/休息的区域 | idle agents |

### 状态映射

| 状态 | 像素动作 | 描述 |
|------|---------|------|
| 🟢 running | 打字/工作 | Agent 正在执行任务 |
| 🟡 thinking | 思考/皱眉 | Agent 正在思考 |
| 🔵 idle | 走动/休息 | 等待任务 |
| 🔴 error | 晕倒/红色 | 出错需要处理 |
| ⚪ offline | 消失/不在 | 未启动 |

## 📂 项目结构

```
dashboard/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── PixelOffice.jsx   # 像素办公室主组件
│   │   │   ├── PixelAgent.jsx    # 像素小人组件
│   │   │   └── StatusPanel.jsx  # 状态面板
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/           # Node.js 后端
│   ├── src/
│   │   └── index.js              # API 服务
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 📄 许可证

MIT License
