import { useState, useEffect } from 'react'

// Agent 颜色配置
const AGENT_COLORS = {
  orchestrator: { body: '#8b5cf6', head: '#a78bfa', name: '议长' },
  backend: { body: '#3b82f6', head: '#60a5fa', name: '后端' },
  frontend: { body: '#ec4899', head: '#f9a8d4', name: '前端' },
  qa: { body: '#f59e0b', head: '#fbbf24', name: '测试' },
  devops: { body: '#10b981', head: '#34d399', name: '运维' },
  reporter: { body: '#06b6d4', head: '#22d3ee', name: '报告' },
}

const STATUS_CONFIG = {
  running: { action: 'typing', emoji: '⌨️' },
  thinking: { action: 'thinking', emoji: '💭' },
  idle: { action: 'walking', emoji: '🚶' },
  error: { action: 'fallen', emoji: '😵' },
  waiting: { action: 'waiting', emoji: '⏳' },
  offline: { action: 'gone', emoji: '' },
}

function PixelAgent({ agent, status, task, zone, index }) {
  const [frame, setFrame] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const colors = AGENT_COLORS[agent.id] || { body: '#6b7280', head: '#9ca3af' }
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  
  const frameCount = status === 'running' ? 4 : status === 'idle' ? 4 : 1

  // 随机初始位置
  useEffect(() => {
    const margin = 10
    const x = zone.x + margin + (index * 12) % (zone.width - margin * 2 - 10)
    const y = zone.y + 15 + Math.floor(index / 2) * 20
    setPosition({ x, y })
  }, [zone, index])

  // 动画循环
  useEffect(() => {
    if (status === 'offline' || status === 'error') return
    
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frameCount)
    }, status === 'running' ? 150 : status === 'thinking' ? 400 : 600)
    
    return () => clearInterval(interval)
  }, [status, frameCount])

  const getOffset = () => {
    switch (status) {
      case 'running':
        return { x: frame % 2 ? -1 : 1, y: 0 }
      case 'thinking':
        return { x: 0, y: frame % 2 ? -3 : 0 }
      case 'idle':
        return { x: Math.sin(frame * Math.PI / 2) * 4, y: 0 }
      default:
        return { x: 0, y: 0 }
    }
  }

  const offset = getOffset()

  if (status === 'offline') return null

  return (
    <div
      className="absolute transition-all duration-200"
      style={{
        left: (position.x + offset.x) + '%',
        top: (position.y + offset.y) + '%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10 + index
      }}
    >
      {/* 任务气泡 */}
      {(status === 'running' || status === 'thinking') && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className={`
            text-xs px-2 py-1 rounded-lg mb-1 font-mono
            ${status === 'running' ? 'bg-blue-600/90 text-white' : ''}
            ${status === 'thinking' ? 'bg-yellow-600/90 text-white' : ''}
          `}>
            {statusConfig.emoji} {task.length > 12 ? task.substring(0, 12) + '..' : task}
          </div>
          <div className={`
            absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45
            ${status === 'running' ? 'bg-blue-600/90' : 'bg-yellow-600/90'}
          `}></div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="text-xs px-2 py-1 rounded-lg mb-1 bg-red-600/90 text-white font-mono">
            😵 {task}
          </div>
        </div>
      )}

      {/* 像素小人 */}
      <div className={`
        relative w-8 h-10
        ${status === 'error' ? 'opacity-50 rotate-12' : ''}
      `}>
        {/* 头部 */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-sm"
          style={{ 
            backgroundColor: colors.head,
            boxShadow: status === 'error' ? '0 0 8px red' : 'none'
          }}
        >
          {status === 'thinking' ? (
            <>
              <div className="absolute top-1.5 left-0.5 w-1 h-1 bg-white rounded-sm"></div>
              <div className="absolute top-1.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
              <div className="absolute -top-4 -right-4 text-xs animate-bounce">💭</div>
            </>
          ) : status === 'error' ? (
            <>
              <div className="absolute top-2 left-0.5 w-1.5 h-0.5 bg-white rotate-45"></div>
              <div className="absolute top-2 right-0.5 w-1.5 h-0.5 bg-white -rotate-45"></div>
            </>
          ) : (
            <>
              <div className="absolute top-1.5 left-0.5 w-1 h-1 bg-white rounded-sm"></div>
              <div className="absolute top-1.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
            </>
          )}
        </div>
        
        {/* 身体 */}
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-3 rounded-sm"
          style={{ backgroundColor: colors.body }}
        >
          {status === 'running' && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">⌨️</div>
          )}
        </div>
        
        {/* 腿 */}
        <div className="absolute top-7 left-1/2 -translate-x-1/2 flex gap-1">
          <div 
            className="w-1.5 h-2 rounded-sm"
            style={{ 
              backgroundColor: colors.body,
              transform: status === 'idle' ? `translateY(${frame % 2 ? -2 : 0}px)` : 'none'
            }}
          ></div>
          <div 
            className="w-1.5 h-2 rounded-sm"
            style={{ 
              backgroundColor: colors.body,
              transform: status === 'idle' ? `translateY(${(frame + 1) % 2 ? -2 : 0}px)` : 'none'
            }}
          ></div>
        </div>
      </div>

      {/* 名字标签 */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/80 whitespace-nowrap bg-black/40 px-1.5 py-0.5 rounded">
        {agent.icon} {agent.name}
      </div>
    </div>
  )
}

export default PixelAgent
