const AGENTS = [
  { id: 'orchestrator', name: '议长', icon: '🏛️' },
  { id: 'backend', name: '后端议员', icon: '⚙️' },
  { id: 'frontend', name: '前端议员', icon: '🎨' },
  { id: 'qa', name: '测试议员', icon: '🧪' },
  { id: 'devops', name: '运维议员', icon: '🚀' },
  { id: 'reporter', name: '报告议员', icon: '📊' },
]

const STATUS_CONFIG = {
  running: { label: '工作中', color: 'text-green-400', bg: 'bg-green-900' },
  thinking: { label: '思考中', color: 'text-yellow-400', bg: 'bg-yellow-900' },
  idle: { label: '待命中', color: 'text-gray-400', bg: 'bg-gray-700' },
  waiting: { label: '等待中', color: 'text-blue-400', bg: 'bg-blue-900' },
  error: { label: '出错', color: 'text-red-400', bg: 'bg-red-900' },
  offline: { label: '离线', color: 'text-gray-500', bg: 'bg-gray-800' },
}

function StatusPanel({ agents }) {
  const getAgent = (id) => agents.find(a => a.id === id)
  
  return (
    <div className="w-72 bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-4">📋 Agent 状态</h2>
      
      <div className="space-y-2">
        {AGENTS.map(agent => {
          const data = getAgent(agent.id)
          const status = data?.status || 'offline'
          const config = STATUS_CONFIG[status] || STATUS_CONFIG.offline
          
          return (
            <div 
              key={agent.id}
              className="bg-gray-700 rounded-lg p-3 flex items-center gap-3"
            >
              <span className="text-2xl">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">{agent.name}</div>
                <div className={`text-xs ${config.color}`}>
                  {config.label}
                </div>
                {data?.currentTask && data.currentTask !== '无任务' && (
                  <div className="text-xs text-gray-400 truncate mt-1">
                    {data.currentTask}
                  </div>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${config.bg}`}></div>
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <h3 className="text-sm text-gray-400 mb-2">图例</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${val.bg}`}></div>
              <span className="text-gray-400">{val.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatusPanel
