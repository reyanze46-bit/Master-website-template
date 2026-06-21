import { useState } from 'react'
import { useApp } from './context/AppContext'
import CampaignBuilder from './components/CampaignBuilder'
import PhoneSimulator from './components/PhoneSimulator'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import LeadsTable from './components/LeadsTable'
import { Rocket, BarChart3, Smartphone, Users, Menu, X, Zap } from 'lucide-react'

const TABS = [
  { id: 'campaigns', label: 'Campaigns', icon: Rocket },
  { id: 'simulator', label: 'Live Test', icon: Smartphone },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
]

export default function App() {
  const { state, dispatch } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const stats = {
    totalEngagements: state.leads.length + Math.floor(state.leads.length * 0.4),
    qualifiedLeads: state.leads.filter(l => l.status === 'qualified').length,
    conversionRate: state.leads.length > 0
      ? Math.round((state.leads.filter(l => l.status === 'qualified').length / (state.leads.length + Math.floor(state.leads.length * 0.4))) * 100)
      : 0,
    activeFunnels: state.campaigns.filter(c => c.active).length,
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl reelflow-gradient shadow-lg shadow-indigo-500/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>  
                <h1 className="text-lg font-bold tracking-tight">
          <span className="reelflow-gradient-text">Digital Patient Concierge</span>
        </h1>
        <p className="text-[10px] text-gray-500 -mt-0.5">La Clinique Monte-Carlo — Monaco</p>
             </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    state.activeTab === tab.id
                      ? 'text-white bg-indigo-500/20 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    dispatch({ type: 'SET_TAB', payload: tab.id })
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    state.activeTab === tab.id
                      ? 'text-white bg-indigo-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="tab-content">
          {state.activeTab === 'campaigns' && <CampaignBuilder />}
          {state.activeTab === 'simulator' && <PhoneSimulator />}
          {state.activeTab === 'analytics' && <AnalyticsDashboard stats={stats} />}
          {state.activeTab === 'leads' && <LeadsTable />}
        </div>
      </main>
    </div>
  )
}
