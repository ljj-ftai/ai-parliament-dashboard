import { useEffect, useRef, useState } from 'react'

// 简单的 Canvas 渲染
function App() {
  const canvasRef = useRef(null)
  const [agents, setAgents] = useState([])
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('local')
  const animationRef = useRef(null)

  const AGENT_LIST = [
    { id: 'orchestrator', name: '🏛️ 议长', color: '#8b5cf6' },
    { id: 'backend', name: '⚙️ 后端', color: '#3b82f6' },
    { id: 'frontend', name: '🎨 前端', color: '#ec4899' },
    { id: 'qa', name: '🧪 测试', color: '#f59e0b' },
    { id: 'devops', name: '🚀 运维', color: '#10b981' },
    { id: 'reporter', name: '📊 报告', color: '#06b6d4' },
  ]

  const ZONES = {
    code: { x: 0, y: 0, w: 50, h: 50, name: '💻 代码区', color: '#1e293b' },
    search: { x: 50, y: 0, w: 25, h: 50, name: '🔍 搜索区', color: '#451a03' },
    write: { x: 75, y: 0, w: 25, h: 50, name: '✍️ 写作区', color: '#1e3a5f' },
    rest: { x: 0, y: 50, w: 100, h: 50, name: '☕ 休息区', color: '#14532d' },
  }

  const AGENT_ZONES = {
    orchestrator: 'search',
    backend: 'code',
    frontend: 'code',
    qa: 'search',
    devops: 'code',
    reporter: 'write',
  }

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = '/api/agents'
        if (mode === 'remote') {
          url = 'http://192.168.150.126:18789/api/sessions'
        }
        
        const res = await fetch(url)
        if (!res.ok) throw new Error('连接失败')
        
        let data = await res.json()
        
        if (mode === 'remote' && data) {
          // 远程模式转换
          const sessions = Object.values(data).filter(s => s.modelProvider)
          data = AGENT_LIST.map((agent, i) => ({
            id: agent.id,
            name: agent.name,
            status: sessions[i]?.modelProvider ? 'running' : 'idle',
            currentTask: sessions[i]?.modelProvider ? '工作中' : '等待任务',
          }))
        }
        
        setAgents(data)
        setError(null)
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [mode])

  // Canvas 渲染
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.get')
    const width = 800
    const height = 600Context('2d
    canvas.width = width
    canvas.height = height

    let frame = 0

    const render = () => {
      frame++
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)

      // 绘制区域
      Object.entries(ZONES).forEach(([key, zone]) => {
        const x = (zone.x / 100) * width
        const y = (zone.y / 100) * height
        const w = (zone.w / 100) * width
        const h = (zone.h / 100) * height
        
        ctx.fillStyle = zone.color
        ctx.globalAlpha = 0.5
        ctx.fillRect(x, y, w, h)
        ctx.globalAlpha = 1
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.strokeRect(x, y, w, h)
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '14px sans-serif'
        ctx.fillText(zone.name, x + 10, y + 25)
      })

      // 绘制中心线
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height / 2)
      ctx.stroke()

      // 绘制 Agents
      AGENT_LIST.forEach((agent, index) => {
        const agentData = agents.find(a => a.id === agent.id)
        const status = agentData?.status || 'offline'
        if (status === 'offline') return

        const zoneId = AGENT_ZONES[agent.id]
        const zone = ZONES[zoneId]
        
        // 随机位置
        const baseX = (zone.x / 100) * width + 50 + (index * 40) % 150
        const baseY = (zone.y / 100) * height + 50 + Math.floor(index / 3) * 80
        
        const x = baseX + (status === 'idle' ? Math.sin(frame / 30 + index) * 20 : 0)
        const y = baseY + (status === 'running' ? Math.sin(frame / 10) * 3 : 0)

        // 绘制像素小人
        ctx.fillStyle = agent.color
        
        // 头部
        ctx.fillRect(x - 8, y - 20, 16, 14)
        
        // 身体
        ctx.fillRect(x - 10, y - 6, 20, 16)
        
        // 腿
        const legOffset = status === 'running' ? Math.sin(frame / 5) * 4 : 0
        ctx.fillRect(x - 6, y + 10, 4, 10 + legOffset)
        ctx.fillRect(x + 2, y + 10, 4, 10 - legOffset)

        // 状态图标
        if (status === 'running') {
          ctx.fillStyle = '#3b82f6'
          ctx.font = '16px sans-serif'
          ctx.fillText('⌨️', x + 12, y - 15)
        } else if (status === 'thinking') {
          ctx.fillStyle = '#f59e0b'
          ctx.font = '16px sans-serif'
          ctx.fillText('💭', x + 12, y - 25)
        }

        // 名字
        ctx.fillStyle = 'white'
        ctx.font = '12px sans-serif'
        ctx.fillText(agent.name.split(' ')[1], x - 15, y + 35)
      })

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [agents])

  const stats = {
    online: agents.filter(a => a.status !== 'offline').length,
    running: agents.filter(a => a.status === 'running').length,
    idle: agents.filter(a => a.status === 'idle').length,
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">🏢 Pixel Office</h1>
          <p className="text-gray-400">OpenClaw Agent 监控</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('local')}
              className={`px-4 py-2 rounded ${mode === 'local' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              本地
            </button>
            <button
              onClick={() => setMode('remote')}
              className={`px-4 py-2 rounded ${mode === 'remote' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              远程 OrangePi
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span>{error ? error : '已连接'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Canvas */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full" style={{ maxHeight: '500px' }} />
        </div>

        {/* 右侧面板 */}
        <div className="w-64 space-y-4">
          {/* 统计 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">📊 统计</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-900/50 p-2 rounded text-center">
                <div className="text-xl font-bold">{stats.online}</div>
                <div className="text-xs text-green-400">在线</div>
              </div>
              <div className="bg-blue-900/50 p-2 rounded text-center">
                <div className="text-xl font-bold">{stats.running}</div>
                <div className="text-xs text-blue-400">工作</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xl font-bold">{stats.idle}</div>
                <div className="text-xs text-gray-400">待命</div>
              </div>
            </div>
          </div>

          {/* Agent 列表 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">🤖 Agents</h3>
            <div className="space-y-2">
              {AGENT_LIST.map(agent => {
                const data = agents.find(a => a.id === agent.id)
                const status = data?.status || 'offline'
                
                return (
                  <div key={agent.id} className="bg-gray-700 rounded p-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      backgroundColor: status === 'running' ? '#22c55e' : status === 'idle' ? '#6b7280' : '#ef4444'
                    }}></div>
                    <div className="flex-1">
                      <div className="text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-400">{data?.currentTask || '未启动'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
