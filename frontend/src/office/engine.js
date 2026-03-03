// Canvas 渲染引擎 - 基于 Pixel Agents 原始代码简化

const TILE_SIZE = 32

// 颜色配置
const AGENT_PALETTES = [
  { body: '#8b5cf6', head: '#a78bfa' },  // 紫色 - 议长
  { body: '#3b82f6', head: '#60a5fa' },  // 蓝色 - 后端
  { body: '#ec4899', head: '#f9a8d4' },  // 粉色 - 前端
  { body: '#f59e0b', head: '#fbbf24' },  // 黄色 - 测试
  { body: '#10b981', head: '#34d399' },  // 绿色 - 运维
  { body: '#06b6d4', head: '#22d3ee' }, // 青色 - 报告
]

// 方向定义
const DIRECTIONS = ['down', 'up', 'right', 'left']

// Agent 状态
const AGENT_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  TYPING: 'typing',
  THINKING: 'thinking',
  READING: 'reading',
  ERROR: 'error',
}

// 像素人模板 (16x32)
const CHARACTER_TEMPLATES = {
  // 站立/走路
  walk: {
    down: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
  // 打字
  typing: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
}

// 区域定义
const ZONES = {
  code: { x: 0, y: 0, width: 8, height: 8, name: '代码区' },
  search: { x: 8, y: 0, width: 4, height: 8, name: '搜索区' },
  write: { x: 12, y: 0, width: 4, height: 8, name: '写作区' },
  rest: { x: 0, y: 8, width: 16, height: 4, name: '休息区' },
}

// Agent 区域分配
const AGENT_ZONE_ASSIGNMENT = {
  orchestrator: 'search',
  backend: 'code',
  frontend: 'code',
  qa: 'search',
  devops: 'code',
  reporter: 'write',
}

class Agent {
  constructor(id, name, paletteIndex, x, y) {
    this.id = id
    this.name = name
    this.palette = AGENT_PALETTES[paletteIndex % AGENT_PALETTES.length]
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
    this.direction = 'down'
    this.state = AGENT_STATES.IDLE
    this.frame = 0
    this.frameTimer = 0
    this.task = ''
    this.visible = true
  }

  setTarget(x, y) {
    this.targetX = x
    this.targetY = y
    if (x > this.x) this.direction = 'right'
    else if (x < this.x) this.direction = 'left'
    else if (y > this.y) this.direction = 'down'
    else if (y < this.y) this.direction = 'up'
  }

  update(deltaTime) {
    // 移动到目标位置
    const speed = 0.5
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist > 0.5) {
      this.x += (dx / dist) * speed
      this.y += (dy / dist) * speed
      this.state = AGENT_STATES.WALKING
    } else if (this.state === AGENT_STATES.WALKING) {
      this.state = AGENT_STATES.IDLE
    }

    // 动画帧更新
    this.frameTimer += deltaTime
    if (this.frameTimer > 200) {
      this.frame = (this.frame + 1) % 4
      this.frameTimer = 0
    }
  }
}

class PixelOfficeEngine {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.agents = []
    this.backgroundImage = null
    this.tilesetImage = null
    this.lastTime = 0
    
    // 加载背景图
    this.loadBackground()
  }

  loadBackground() {
    const bg = new Image()
    bg.src = '/assets/office_bg.png'
    bg.onload = () => {
      this.backgroundImage = bg
    }
  }

  setAgents(agentData) {
    // 清除不存在的 agent
    const currentIds = this.agents.map(a => a.id)
    const newIds = agentData.map(a => a.id)
    
    // 移除不存在的
    this.agents = this.agents.filter(a => newIds.includes(a.id))
    
    // 更新或添加
    agentData.forEach((data, index) => {
      let agent = this.agents.find(a => a.id === data.id)
      
      if (!agent) {
        // 新建 agent
        const zone = AGENT_ZONE_ASSIGNMENT[data.id] || 'rest'
        const zoneDef = ZONES[zone]
        const startX = zoneDef.x + 1 + (index % 3) * 2
        const startY = zoneDef.y + 1 + Math.floor(index / 3) * 2
        
        agent = new Agent(data.id, data.name, index, startX, startY)
        this.agents.push(agent)
      }
      
      // 更新状态
      agent.name = data.name
      agent.task = data.currentTask || ''
      
      // 根据状态设置目标位置
      const status = data.status
      if (status === 'offline' || status === undefined) {
        agent.visible = false
      } else {
        agent.visible = true
        
        if (status === 'running' || status === 'typing') {
          agent.state = AGENT_STATES.TYPING
        } else if (status === 'thinking') {
          agent.state = AGENT_STATES.THINKING
        } else if (status === 'error') {
          agent.state = AGENT_STATES.ERROR
        } else if (status === 'idle' || status === 'waiting') {
          // 随机移动
          const zone = AGENT_ZONE_ASSIGNMENT[data.id] || 'rest'
          const zoneDef = ZONES[zone]
          if (Math.random() < 0.02) {
            const newX = zoneDef.x + 1 + Math.floor(Math.random() * (zoneDef.width - 2))
            const newY = zoneDef.y + 1 + Math.floor(Math.random() * (zoneDef.height - 2))
            agent.setTarget(newX, newY)
          }
        }
      }
    })
  }

  update(deltaTime) {
    this.agents.forEach(agent => {
      if (agent.visible) {
        agent.update(deltaTime)
      }
    })
  }

  render() {
    const ctx = this.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const tileW = width / 16
    const tileH = height / 12

    // 清空
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)

    // 绘制背景
    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, width, height)
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1
    } else {
      // 绘制区域背景
      Object.entries(ZONES).forEach(([key, zone]) => {
        const colors = {
          code: 'rgba(45, 55, 72, 0.5)',
          search: 'rgba(116, 66, 16, 0.4)',
          write: 'rgba(44, 82, 130, 0.4)',
          rest: 'rgba(39, 103, 73, 0.4)',
        }
        ctx.fillStyle = colors[key]
        ctx.fillRect(zone.x * tileW, zone.y * tileH, zone.width * tileW, zone.height * tileH)
        
        // 区域边框
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.strokeRect(zone.x * tileW, zone.y * tileH, zone.width * tileW, zone.height * tileH)
        
        // 区域名称
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = '10px monospace'
        ctx.fillText(zone.name, zone.x * tileW + 4, zone.y * tileH + 14)
      })
    }

    // 绘制网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath()
      ctx.moveTo(i * tileW, 0)
      ctx.lineTo(i * tileW, height)
      ctx.stroke()
    }
    for (let i = 0; i <= 12; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * tileH)
      ctx.lineTo(width, i * tileH)
      ctx.stroke()
    }

    // 绘制 agents
    this.agents.forEach(agent => {
      if (!agent.visible) return
      this.drawAgent(ctx, agent, tileW, tileH)
    })
  }

  drawAgent(ctx, agent, tileW, tileH) {
    const x = agent.x * tileW
    const y = agent.y * tileH
    const scale = Math.min(tileW, tileH) / 16

    // 状态颜色
    let bodyColor = agent.palette.body
    let headColor = agent.palette.head
    
    if (agent.state === AGENT_STATES.ERROR) {
      bodyColor = '#ff0000'
      headColor = '#ff6666'
    }

    // 获取模板
    const template = agent.state === AGENT_STATES.TYPING || agent.state === AGENT_STATES.THINKING
      ? CHARACTER_TEMPLATES.typing
      : CHARACTER_TEMPLATES.walk.down

    // 绘制身体 (像素风格)
    const pixels = template
    for (let row = 0; row < pixels.length; row++) {
      for (let col = 0; col < pixels[row].length; col++) {
        if (pixels[row][col]) {
          const px = x + col * scale
          const py = y + row * scale
          
          // 头部 vs 身体
          if (row < 8) {
            ctx.fillStyle = headColor
          } else {
            ctx.fillStyle = bodyColor
          }
          
          ctx.fillRect(px, py, scale, scale)
        }
      }
    }

    // 任务气泡
    if (agent.task && (agent.state === AGENT_STATES.TYPING || agent.state === AGENT_STATES.THINKING)) {
      const bubbleX = x + 16 * scale
      const bubbleY = y - 8
      
      ctx.fillStyle = agent.state === AGENT_STATES.THINKING ? '#f59e0b' : '#3b82f6'
      ctx.beginPath()
      ctx.roundRect(bubbleX, bubbleY, Math.min(agent.task.length * 6, 100), 16, 4)
      ctx.fill()
      
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.fillText(agent.task.substring(0, 15), bubbleX + 4, bubbleY + 11)
    }

    // 名字标签
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(x, y + 28 * scale, agent.name.length * 6 + 4, 12)
    ctx.fillStyle = '#fff'
    ctx.font = '10px monospace'
    ctx.fillText(agent.name, x + 2, y + 37 * scale)
  }

  start() {
    const gameLoop = (time) => {
      const deltaTime = time - this.lastTime
      this.lastTime = time
      
      this.update(deltaTime)
      this.render()
      
      requestAnimationFrame(gameLoop)
    }
    requestAnimationFrame(gameLoop)
  }
}

// 导出
window.PixelOfficeEngine = PixelOfficeEngine
