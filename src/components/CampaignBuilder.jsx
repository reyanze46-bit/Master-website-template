import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Edit3, Play, ToggleLeft, ToggleRight, MessageSquare, Link, Hash, Sparkles, GripVertical, Rocket } from 'lucide-react'

const DEFAULT_QUESTIONS = [
  { id: 'q1', field: 'name', label: 'What is your name?', required: true },
  { id: 'q2', field: 'email', label: 'What is your email address?', required: true },
  { id: 'q3', field: 'budget', label: 'What is your monthly budget?', required: false },
]

export default function CampaignBuilder() {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', videoUrl: '', triggerKeyword: '', questions: [...DEFAULT_QUESTIONS] })

  const resetForm = () => {
    setForm({ name: '', videoUrl: '', triggerKeyword: '', questions: [...DEFAULT_QUESTIONS] })
    setEditingId(null)
    setShowForm(false)
  }

  const handleAdd = () => {
    if (!form.name.trim() || !form.videoUrl.trim() || !form.triggerKeyword.trim()) return
    if (editingId) {
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id: editingId, ...form, triggerKeyword: form.triggerKeyword.toUpperCase() } })
    } else {
      dispatch({ type: 'ADD_CAMPAIGN', payload: form })
    }
    resetForm()
  }

  const handleEdit = (campaign) => {
    setForm({
      name: campaign.name,
      videoUrl: campaign.videoUrl,
      triggerKeyword: campaign.triggerKeyword,
      questions: campaign.questions || [...DEFAULT_QUESTIONS],
    })
    setEditingId(campaign.id)
    setShowForm(true)
  }

  const addQuestion = () => {
    const newId = 'q' + Date.now()
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { id: newId, field: 'text', label: '', required: false }],
    }))
  }

  const updateQuestion = (id, key, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [key]: value } : q),
    }))
  }

  const removeQuestion = (id) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }))
  }

  const startSimulator = (campaignId) => {
    dispatch({ type: 'SET_TAB', payload: 'simulator' })
    dispatch({ type: 'START_SIMULATOR', payload: { campaignId } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <p className="text-gray-400 text-sm mt-1">Build and manage your reel-to-lead funnels</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              {editingId ? 'Edit Campaign' : 'Create New Campaign'}
            </h3>
            <button onClick={resetForm} className="btn-ghost">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g., Growth Flow Q1"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <Link className="h-3.5 w-3.5 inline mr-1" />
                Reel / Video URL
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/reel/..."
                value={form.videoUrl}
                onChange={e => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <Hash className="h-3.5 w-3.5 inline mr-1" />
                Trigger Keyword
              </label>
              <input
                type="text"
                placeholder="e.g., FLOW, REEL, GROWTH"
                value={form.triggerKeyword}
                onChange={e => setForm(prev => ({ ...prev, triggerKeyword: e.target.value.toUpperCase() }))}
                className="input-field font-mono uppercase"
                maxLength={20}
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                DM Qualification Questions
              </label>
              <button onClick={addQuestion} className="btn-secondary text-xs px-3 py-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Question
              </button>
            </div>
            <div className="space-y-2">
              {form.questions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3">
                  <GripVertical className="h-4 w-4 text-gray-600 shrink-0" />
                  <span className="text-xs text-gray-500 w-6 shrink-0">#{i + 1}</span>
                  <input
                    type="text"
                    placeholder="Question text..."
                    value={q.label}
                    onChange={e => updateQuestion(q.id, 'label', e.target.value)}
                    className="input-field flex-1 text-sm"
                  />
                  <select
                    value={q.field}
                    onChange={e => updateQuestion(q.id, 'field', e.target.value)}
                    className="input-field w-32 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="budget">Budget</option>
                    <option value="website">Website</option>
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    disabled={form.questions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={resetForm} className="btn-secondary">Cancel</button>
            <button
              onClick={handleAdd}
              className="btn-primary"
              disabled={!form.name.trim() || !form.videoUrl.trim() || !form.triggerKeyword.trim()}
            >
              {editingId ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* Campaign List */}
      {state.campaigns.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">No campaigns yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Create your first reel-to-lead campaign to start converting video engagement into qualified leads.
          </p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.campaigns.map(campaign => (
            <div key={campaign.id} className="card hover:border-indigo-500/30 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{campaign.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {campaign.questions.length} questions · Trigger: <span className="font-mono text-indigo-400">{campaign.triggerKeyword}</span>
                  </p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_CAMPAIGN', payload: campaign.id })}
                  className="shrink-0"
                >
                  {campaign.active
                    ? <ToggleRight className="h-5 w-5 text-indigo-400" />
                    : <ToggleLeft className="h-5 w-5 text-gray-600" />
                  }
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link className="h-3 w-3" />
                <span className="truncate">{campaign.videoUrl || 'No URL set'}</span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="btn-ghost text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => startSimulator(campaign.id)}
                  className="btn-ghost text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <Play className="h-3.5 w-3.5" /> Test
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_CAMPAIGN', payload: campaign.id })}
                  className="btn-ghost text-xs text-red-400 hover:text-red-300 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}