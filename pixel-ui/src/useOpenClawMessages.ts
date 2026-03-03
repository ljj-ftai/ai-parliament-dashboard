import { useState, useEffect, useRef } from 'react'
import type { OfficeState } from './office/engine/officeState.js'
import { createCharacter } from './office/engine/characters.js'

// Agent 映射
const AGENT_MAPPING = [
  { id: 0, name: 'orchestrator', label: '🏛️ 议长', palette: 0 },
  { id: 1, name: 'backend', label: '⚙️ 后端', palette: 1 },
  { id: 2, name: 'frontend', label: '🎨 前端', palette: 2 },
  { id: 3, name: 'qa', label: '🧪 测试', palette: 3 },
  { id: 4, name: 'devops', label: '🚀 运维', palette: 4 },
  { id: 5, name: 'reporter', label: '📊 报告', palette: 5 },
]

export interface OpenClawAgent {
  id: string
  name: string
  status: string
  currentTask: string
  progress: number
}

export function useOpenClawMessages(
  getOfficeState: () => OfficeState,
  apiUrl: string = '/api/agents'
) {
  const [agents, setAgents] = useState<number[]>([])
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [agentTools, setAgentTools] = useState<Record<number, any[]>>({})
  const [agentStatuses, setAgentStatuses] = useState<Record<number, string>>({})
  const [layoutReady, setLayoutReady] = useState(false)
  const [workspaceFolders, setWorkspaceFolders] = useState<{ name: string; path: string }[]>([])
  
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 初始化 agents
  useEffect(() => {
    const os = getOfficeState()
    
    // 创建初始的 characters
    AGENT_MAPPING.forEach((agent) => {
      if (!os.characters.has(agent.id)) {
        const char = createCharacter(agent.id, agent.palette, null, null, 0)
        os.characters.set(agent.id, char)
      }
    })
    
    setAgents(AGENT_MAPPING.map(a => a.id))
    setLayoutReady(true)
  }, [])

  // 轮询 OpenClaw API
  useEffect(() => {
    const pollOpenClaw = async () => {
      try {
        const res = await fetch(apiUrl)
        if (!res.ok) return
        
        const data: OpenClawAgent[] = await res.json()
        const os = getOfficeState()
        
        // 更新每个 agent 的状态
        data.forEach((agentData, index) => {
          const charId = AGENT_MAPPING[index]?.id
          if (charId === undefined) return
          
          const char = os.characters.get(charId)
          if (!char) return
          
          // 根据状态更新 character
          if (agentData.status === 'running' || agentData.status === 'typing') {
            char.state = 'type'
            char.isActive = true
            char.currentTool = 'code'
          } else if (agentData.status === 'thinking') {
            char.state = 'type'
            char.isActive = true
          } else if (agentData.status === 'idle' || agentData.status === 'waiting') {
            char.state = 'idle'
            char.isActive = false
          } else if (agentData.status === 'error') {
            char.state = 'idle'
            char.isActive = false
          }
          
          // 更新状态
          setAgentStatuses(prev => ({
            ...prev,
            [charId]: agentData.status
          }))
        })
        
      } catch (err) {
        console.error('Polling error:', err)
      }
    }

    // 立即执行一次
    pollOpenClaw()
    
    // 每 3 秒轮询
    pollingRef.current = setInterval(pollOpenClaw, 3000)
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [apiUrl])

  return {
    agents,
    selectedAgent,
    agentTools,
    agentStatuses,
    subagentTools: {},
    subagentCharacters: [],
    layoutReady,
    loadedAssets: undefined,
    workspaceFolders
  }
}
