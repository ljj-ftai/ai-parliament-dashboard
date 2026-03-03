import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// 配置
const config = {
  // 本地 sessions 文件路径
  localSessionsFile: '/home/orangepi/.openclaw/agents/orchestrator/sessions/sessions.json',
  // 远程 Gateway URL
  remoteUrl: process.env.OPENCLAW_URL || 'http://192.168.150.126:18789',
  // 使用远程模式
  useRemote: process.env.USE_REMOTE === 'true',
}

// 议员定义
const AGENTS = [
  { id: 'orchestrator', name: '🏛️ 议长', type: 'manager' },
  { id: 'backend', name: '⚙️ 后端议员', type: 'code' },
  { id: 'frontend', name: '🎨 前端议员', type: 'code' },
  { id: 'qa', name: '🧪 测试议员', type: 'search' },
  { id: 'devops', name: '🚀 运维议员', type: 'code' },
  { id: 'reporter', name: '📊 报告议员', type: 'write' },
]

// 从远程 API 获取 sessions
async function fetchRemoteSessions() {
  try {
    // 尝试多个 API 端点
    const endpoints = [
      `${config.remoteUrl}/api/sessions`,
      `${config.remoteUrl}/v1/sessions`,
    ]
    
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Remote sessions fetched successfully')
          return data
        }
      } catch (e) {
        console.log(`Failed to fetch from ${url}:`, e.message)
      }
    }
    return null
  } catch (error) {
    console.error('Remote fetch error:', error.message)
    return null
  }
}

// 从本地文件获取 sessions
async function fetchLocalSessions() {
  try {
    const data = await fs.readFile(config.localSessionsFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Local fetch error:', error.message)
    return null
  }
}

// 获取 sessions 数据
async function getSessions() {
  if (config.useRemote) {
    return await fetchRemoteSessions()
  }
  return await fetchLocalSessions()
}

// 分析 session 状态
function analyzeSessionStatus(session) {
  if (!session || !session.modelProvider) {
    return { status: 'offline', currentTask: '未启动', progress: 0 }
  }

  const hasRecentActivity = session.lastMessageAt && 
    (Date.now() - new Date(session.lastMessageAt).getTime()) < 60000

  if (!hasRecentActivity) {
    return { status: 'idle', currentTask: '等待任务', progress: 0 }
  }

  // 分析任务类型
  let task = '工作中'
  let status = 'running'
  
  if (session.systemPromptReport) {
    const prompt = session.systemPromptReport.systemPrompt || ''
    if (prompt.includes('写代码') || prompt.includes('代码') || prompt.includes('implement')) {
      task = '编写代码中'
    } else if (prompt.includes('搜索') || prompt.includes('查找') || prompt.includes('search')) {
      task = '搜索信息中'
    } else if (prompt.includes('测试') || prompt.includes('验证') || prompt.includes('test')) {
      task = '测试验证中'
    } else if (prompt.includes('报告') || prompt.includes('总结') || prompt.includes('report')) {
      task = '撰写报告中'
    }
  }

  // 随机模拟思考状态
  if (Math.random() > 0.8) {
    status = 'thinking'
    task = '思考中...'
  }

  return {
    status,
    currentTask: task,
    progress: hasRecentActivity ? Math.floor(Math.random() * 40) + 60 : 0,
    model: session.model,
    provider: session.modelProvider,
    lastActivity: session.lastMessageAt
  }
}

// 读取 sessions 并分析状态
async function getAgentStatus(agentId) {
  try {
    const sessions = await getSessions()
    
    if (!sessions || Object.keys(sessions).length === 0) {
      return { 
        status: 'offline', 
        currentTask: '未启动', 
        progress: 0,
        lastActivity: null
      }
    }

    // 如果是远程模式，直接返回 sessions 数据
    if (config.useRemote && typeof sessions === 'object' && !Array.isArray(sessions)) {
      // 远程返回的是 sessions 对象
      const sessionValues = Object.values(sessions)
      if (sessionValues.length === 0) {
        return { status: 'idle', currentTask: '等待任务', progress: 0 }
      }
      
      // 取第一个活跃 session
      const activeSession = sessionValues.find(s => s.modelProvider)
      if (activeSession) {
        return analyzeSessionStatus(activeSession)
      }
      return { status: 'idle', currentTask: '等待任务', progress: 0 }
    }
    
    // 本地模式：sessions 是对象
    const activeSessions = Object.values(sessions).filter(s => 
      s.modelProvider && s.model && s.sessionId
    )
    
    if (activeSessions.length === 0) {
      return { 
        status: 'idle', 
        currentTask: '等待任务', 
        progress: 0 
      }
    }
    
    // 议长状态
    if (agentId === 'orchestrator') {
      return analyzeSessionStatus(activeSessions[0])
    }
    
    // 其他议员 - 检查是否有相关会话
    const relevantSession = activeSessions.find(s => 
      s.sessionKey && s.sessionKey.includes(agentId)
    )
    
    if (relevantSession) {
      return analyzeSessionStatus(relevantSession)
    }
    
    return { 
      status: 'idle', 
      currentTask: '等待任务', 
      progress: 0 
    }
    
  } catch (error) {
    console.error(`Error getting status for ${agentId}:`, error.message)
    return { 
      status: 'error', 
      currentTask: '连接错误', 
      progress: 0, 
      error: error.message 
    }
  }
}

// 获取所有议员状态
async function getAllAgentStatus() {
  const results = await Promise.all(
    AGENTS.map(async (agent) => {
      const status = await getAgentStatus(agent.id)
      return {
        id: agent.id,
        name: agent.name,
        ...status,
        updatedAt: new Date().toISOString()
      }
    })
  )
  return results
}

// API: 获取所有议员状态
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await getAllAgentStatus()
    res.json(agents)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// API: 获取配置
app.get('/api/config', (req, res) => {
  res.json({
    useRemote: config.useRemote,
    remoteUrl: config.remoteUrl,
    mode: config.useRemote ? 'remote' : 'local'
  })
})

// API: 设置配置
app.post('/api/config', (req, res) => {
  if (req.body.useRemote !== undefined) {
    config.useRemote = req.body.useRemote
  }
  if (req.body.remoteUrl) {
    config.remoteUrl = req.body.remoteUrl
  }
  res.json({ success: true, config })
})

// API: 远程模式 - 代理到 OrangePi Gateway
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await getSessions()
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: { 
      mode: config.useRemote ? 'remote' : 'local',
      remoteUrl: config.remoteUrl 
    }
  })
})

// WebSocket 连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  getAllAgentStatus().then(agents => {
    socket.emit('init', agents)
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// 每 3 秒更新状态
async function updateStatus() {
  const agents = await getAllAgentStatus()
  io.emit('agentsUpdate', agents)
}

setInterval(updateStatus, 3000)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pixel Office Server running on port ${PORT}`)
  console.log(`📡 Mode: ${config.useRemote ? 'remote' : 'local'}`)
  if (config.useRemote) {
    console.log(`🌐 Remote URL: ${config.remoteUrl}`)
  }
  console.log(`📊 API: http://localhost:${PORT}/api/agents`)
})
