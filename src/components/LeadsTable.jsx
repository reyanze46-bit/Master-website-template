import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Search, Download, Filter, Trash2, ChevronDown, Mail, User, Globe, DollarSign, CheckCircle, Clock } from 'lucide-react'

export default function LeadsTable() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filterCampaign, setFilterCampaign] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredLeads = useMemo(() => {
    return state.leads.filter(lead => {
      const matchesSearch = !search ||
        lead.handle.toLowerCase().includes(search.toLowerCase()) ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.campaignName.toLowerCase().includes(search.toLowerCase())

      const matchesCampaign = filterCampaign === 'all' || lead.campaignId === filterCampaign
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus

      return matchesSearch && matchesCampaign && matchesStatus
    })
  }, [state.leads, search, filterCampaign, filterStatus])

  const exportCsv = () => {
    const headers = ['Timestamp', 'Instagram Handle', 'Campaign', 'Name', 'Email', 'Qualifiers', 'Status']
    const rows = filteredLeads.map(lead => [
      new Date(lead.timestamp).toLocaleString(),
      lead.handle,
      lead.campaignName,
      lead.name,
      lead.email,
      Object.entries(lead.qualifiers).map(([k, v]) => `${k}: ${v}`).join('; '),
      lead.status,
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reelflow-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getQualifierIcon = (field) => {
    switch (field) {
      case 'email': return Mail
      case 'website': return Globe
      case 'budget': return DollarSign
      default: return User
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads</h2>
          <p className="text-gray-400 text-sm mt-1">{state.leads.length} total captured leads</p>
        </div>
        {state.leads.length > 0 && (
          <button onClick={exportCsv} className="btn-primary">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by handle, name, email, or campaign..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'border-indigo-500/50' : ''}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-3 card py-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Campaign</label>
            <select
              value={filterCampaign}
              onChange={e => setFilterCampaign(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Campaigns</option>
              {state.campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">
            {state.leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {state.leads.length === 0
              ? 'Leads will appear here when users complete your DM qualification funnel. Try testing a campaign in the simulator!'
              : 'Try adjusting your search or filters to find what you\'re looking for.'
            }
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Timestamp</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Handle</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Qualifiers</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 font-medium text-[11px] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(lead.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-indigo-400 font-mono text-xs">{lead.handle}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{lead.campaignName}</td>
                    <td className="px-5 py-3">
                      <span className="text-gray-200 font-medium">{lead.name || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-gray-400 text-xs">{lead.email || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(lead.qualifiers).map(([key, val]) => {
                          if (key === 'name' || key === 'email') return null
                          const Icon = getQualifierIcon(key)
                          return (
                            <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-400">
                              <Icon className="h-3 w-3" />
                              {val}
                            </span>
                          )
                        })}
                        {Object.keys(lead.qualifiers).filter(k => k !== 'name' && k !== 'email').length === 0 && (
                          <span className="text-gray-600 text-[10px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        lead.status === 'qualified'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {lead.status === 'qualified'
                          ? <><CheckCircle className="h-3 w-3" /> Qualified</>
                          : <><Clock className="h-3 w-3" /> In Progress</>
                        }
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => dispatch({ type: 'DELETE_LEAD', payload: lead.id })}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredLeads.length} of {state.leads.length} leads</span>
            <button onClick={exportCsv} className="text-indigo-400 hover:text-indigo-300">
              <Download className="h-3.5 w-3.5 inline mr-1" />
              Export all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}