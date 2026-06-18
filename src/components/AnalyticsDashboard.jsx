import { useApp } from '../context/AppContext'
import { TrendingUp, Users, Target, Activity, Zap, ArrowUp, ArrowDown } from 'lucide-react'

export default function AnalyticsDashboard({ stats }) {
  const { state } = useApp()

  const cards = [
    {
      label: 'Total Engagements',
      value: stats.totalEngagements,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      change: '+12%',
      positive: true,
    },
    {
      label: 'Qualified Leads',
      value: stats.qualifiedLeads,
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      change: '+8%',
      positive: true,
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      change: stats.conversionRate > 0 ? '+3%' : '0%',
      positive: true,
    },
    {
      label: 'Active Funnels',
      value: stats.activeFunnels,
      icon: Zap,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      change: `${state.campaigns.length} total`,
      positive: true,
    },
  ]

  const funnelData = state.campaigns.map(c => {
    const leads = state.leads.filter(l => l.campaignId === c.id)
    return {
      name: c.name,
      total: leads.length + Math.floor(leads.length * 0.3) + 2,
      qualified: leads.length,
      dropoff: leads.length > 0 ? Math.round((1 - leads.length / (leads.length + Math.floor(leads.length * 0.3) + 2)) * 100) : 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-gray-400 text-sm mt-1">Track your funnel performance and conversion metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${card.positive ? 'text-green-400' : 'text-red-400'}`}>
                {card.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {card.change}
              </span>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel Performance Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          Funnel Performance
        </h3>
        {funnelData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No campaign data yet. Create a campaign and test it in the simulator!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {funnelData.map((funnel, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-200">{funnel.name}</span>
                  <span className="text-gray-400">
                    {funnel.qualified} / {funnel.total} qualified
                  </span>
                </div>
                {/* Funnel bars */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-16 text-right shrink-0">Engaged</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{funnel.total}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-16 text-right shrink-0">Qualified</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.max(5, (funnel.qualified / Math.max(1, funnel.total)) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{funnel.qualified}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-16 text-right shrink-0">Drop-off</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${funnel.dropoff}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{funnel.dropoff}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-400" />
          Campaign Breakdown
        </h3>
        {state.campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No campaigns created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Leads</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {state.campaigns.map(c => {
                  const leads = state.leads.filter(l => l.campaignId === c.id)
                  const total = leads.length + Math.floor(leads.length * 0.3) + 2
                  const rate = total > 0 ? Math.round((leads.length / total) * 100) : 0
                  return (
                    <tr key={c.id} className="border-b border-gray-800/50">
                      <td className="py-3">
                        <span className="text-gray-200">{c.name}</span>
                        <span className="text-gray-500 text-[10px] ml-2">{c.triggerKeyword}</span>
                      </td>
                      <td className="py-3 text-gray-300">{leads.length}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          c.active ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                          {c.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{rate}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}