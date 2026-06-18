import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { Send, User, Bot, ArrowLeft, Play, ChevronRight, Smartphone, MessageCircle } from 'lucide-react'
import { createBotMessages, getQuestionMessage, getValidationError, getClosingMessages, generateHandle } from '../lib/simulation'

export default function PhoneSimulator() {
  const { state, dispatch } = useApp()
  const { campaigns, simulatorState } = state
  const [commentText, setCommentText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimerRef = useRef(null)

  const campaign = simulatorState
    ? campaigns.find(c => c.id === simulatorState.campaignId)
    : null

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [simulatorState?.messages])

  const addBotMessageWithDelay = useCallback((content) => {
    setIsTyping(true)
    typingTimerRef.current = setTimeout(() => {
      dispatch({
        type: 'ADD_SIMULATOR_MESSAGE',
        payload: { role: 'bot', content, timestamp: Date.now() }
      })
      setIsTyping(false)
    }, 900)
  }, [dispatch])

  const startQualification = useCallback(() => {
    if (!campaign) return
    const { intro, welcome } = createBotMessages(campaign)

    dispatch({
      type: 'ADD_SIMULATOR_MESSAGE',
      payload: { role: 'bot', content: intro, timestamp: Date.now() }
    })
    dispatch({ type: 'SET_SIMULATOR_HANDLE', payload: generateHandle() })

    setTimeout(() => {
      dispatch({
        type: 'ADD_SIMULATOR_MESSAGE',
        payload: { role: 'bot', content: welcome, timestamp: Date.now() }
      })
      dispatch({ type: 'SET_SIMULATOR_STEP', payload: 0 })

      setTimeout(() => {
        if (campaign.questions.length > 0) {
          const firstQ = campaign.questions[0]
          addBotMessageWithDelay(getQuestionMessage(firstQ.label, 0, campaign.questions.length))
        }
      }, 1000)
    }, 1200)
  }, [campaign, dispatch, addBotMessageWithDelay])

  // Handle comment submission
  const handleComment = () => {
    if (!commentText.trim()) return
    const comment = commentText.trim()

    dispatch({
      type: 'ADD_SIMULATOR_MESSAGE',
      payload: { role: 'user', content: comment, timestamp: Date.now(), isComment: true }
    })

    if (campaign && comment.toUpperCase() === campaign.triggerKeyword) {
      dispatch({ type: 'SET_SIMULATOR_STAGE', payload: 'dm' })
      setTimeout(() => startQualification(), 800)
    } else {
      // Wrong keyword
      dispatch({
        type: 'ADD_SIMULATOR_MESSAGE',
        payload: {
          role: 'bot',
          content: `👋 Thanks for commenting! Try typing **${campaign?.triggerKeyword || 'the trigger keyword'}** to get started.`,
          timestamp: Date.now()
        }
      })
    }
    setCommentText('')
  }

  // Handle DM reply
  const handleDmReply = () => {
    if (!userInput.trim() || isTyping || !campaign) return

    const reply = userInput.trim()
    const step = simulatorState.currentStep
    const question = campaign.questions[step]

    // Validate
    if (question) {
      const validationError = getValidationError(question.field, reply)
      if (validationError) {
        setError(validationError)
        return
      }
    }
    setError(null)

    // Add user message
    dispatch({
      type: 'ADD_SIMULATOR_MESSAGE',
      payload: { role: 'user', content: reply, timestamp: Date.now() }
    })

    // Store collected data
    if (question) {
      dispatch({
        type: 'UPDATE_COLLECTED',
        payload: { [question.field]: reply }
      })
    }

    setUserInput('')

    // Advance to next question or complete
    const nextStep = step + 1
    if (nextStep < campaign.questions.length) {
      dispatch({ type: 'SET_SIMULATOR_STEP', payload: nextStep })
      const nextQ = campaign.questions[nextStep]
      addBotMessageWithDelay(getQuestionMessage(nextQ.label, nextStep, campaign.questions.length))
    } else {
      // Qualification complete!
      dispatch({ type: 'SET_SIMULATOR_STEP', payload: campaign.questions.length })

      setTimeout(() => {
        const closing = getClosingMessages(campaign)
        let delay = 0
        closing.forEach((msg, i) => {
          setTimeout(() => {
            dispatch({
              type: 'ADD_SIMULATOR_MESSAGE',
              payload: { role: 'bot', content: msg, timestamp: Date.now() }
            })
          }, delay)
          delay += 1200
        })

        // Save lead
        setTimeout(() => {
          const collected = { ...simulatorState.collected }
          dispatch({
            type: 'ADD_LEAD',
            payload: {
              campaignId: campaign.id,
              campaignName: campaign.name,
              handle: simulatorState.handle,
              name: collected.name || '',
              email: collected.email || '',
              qualifiers: collected,
              status: 'qualified',
            }
          })
          dispatch({ type: 'SET_SIMULATOR_STAGE', payload: 'complete' })
        }, delay + 500)
      }, 800)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (simulatorState?.stage === 'reels') {
        handleComment()
      } else if (simulatorState?.stage === 'dm' || simulatorState?.stage === 'qualify') {
        handleDmReply()
      }
    }
  }

  const resetSimulator = () => {
    dispatch({ type: 'RESET_SIMULATOR' })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    setCommentText('')
    setUserInput('')
    setError(null)
    setIsTyping(false)
  }

  const selectCampaign = (campaignId) => {
    dispatch({ type: 'START_SIMULATOR', payload: { campaignId } })
  }

  // Clean up timers
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  // No campaign selected
  if (!simulatorState || !campaign) {
    const activeCampaigns = campaigns.filter(c => c.active)
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Live Test Simulator</h2>
          <p className="text-gray-400 text-sm mt-1">Experience your reel-to-lead funnel in action</p>
        </div>
        {activeCampaigns.length === 0 ? (
          <div className="card text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-1">No active campaigns</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Create and activate a campaign first, then test it here in the simulator.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'campaigns' })}
              className="btn-primary"
            >
              <Play className="h-4 w-4" /> Go to Campaigns
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns.map(c => (
              <button
                key={c.id}
                onClick={() => selectCampaign(c.id)}
                className="card text-left hover:border-indigo-500/50 transition-all group"
              >
                <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">{c.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{c.questions.length} questions in funnel</p>
                <div className="mt-3 flex items-center gap-1 text-sm text-indigo-400">
                  Test this campaign <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const isComplete = simulatorState.stage === 'complete'
  const showCommentInput = simulatorState.stage === 'reels'
  const showDmInput = (simulatorState.stage === 'dm' || simulatorState.stage === 'qualify') && !isComplete

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Test Simulator</h2>
          <p className="text-gray-400 text-sm mt-1">Testing: <span className="text-indigo-400 font-medium">{campaign.name}</span></p>
        </div>
        <button onClick={resetSimulator} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to campaigns
        </button>
      </div>

      <div className="flex justify-center">
        {/* Phone Frame */}
        <div className="phone-frame">
          {/* Notch */}
          <div className="phone-notch" />
          {/* Status Bar */}
          <div className="phone-status-bar pt-3">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-2 border border-gray-400 rounded-sm relative">
                <div className="absolute inset-0.5 bg-green-400 rounded-sm" style={{ width: '70%' }} />
              </div>
              <span className="text-[10px]">5G</span>
              <span className="text-[10px]">🔋</span>
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold flex-1">Instagram</span>
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>

          {/* Content Area */}
          <div className="h-[calc(100%-100px)] overflow-y-auto px-3 py-3 space-y-2">
            {simulatorState.stage === 'reels' && (
              <div className="text-center py-4 space-y-3">
                {/* Video Placeholder */}
                <div className="w-full aspect-[9/16] max-h-[280px] rounded-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-pink-900/60 flex items-center justify-center border border-gray-800">
                  <div className="text-center">
                    <Play className="h-10 w-10 text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Reel Preview</p>
                    <p className="text-[10px] text-gray-600 mt-1 truncate max-w-[200px] px-4">{campaign.videoUrl}</p>
                  </div>
                </div>

                {/* Caption */}
                <div className="text-left px-2">
                  <p className="text-xs text-gray-300">
                    <strong className="text-white">@{simulatorState.handle || 'creator'}</strong> Drop a comment with <span className="text-indigo-400 font-mono font-bold">{campaign.triggerKeyword}</span> for a special offer! 🚀
                  </p>
                </div>

                {/* Existing messages (like the initial bot responses after comment) */}
                {simulatorState.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                      msg.isComment
                        ? 'bg-gray-800 text-gray-300 rounded-br-md'
                        : msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-gray-200 rounded-bl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {simulatorState.stage !== 'reels' && (
              <div className="space-y-2">
                {/* DM Messages */}
                {simulatorState.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-gray-200 rounded-bl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}

                {isComplete && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                      ✅ Lead captured successfully!
                    </div>
                    <div className="mt-2">
                      <button onClick={resetSimulator} className="text-xs text-indigo-400 hover:text-indigo-300">
                        Test another campaign →
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {showCommentInput && (
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800 bg-gray-900">
              {error && <p className="text-red-400 text-[10px] mb-1">{error}</p>}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Type "${campaign.triggerKeyword}" to trigger...`}
                  value={commentText}
                  onChange={e => { setCommentText(e.target.value); setError(null) }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-gray-800 text-xs text-gray-100 rounded-full px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500/50 placeholder-gray-600"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center disabled:opacity-40 transition-all"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {showDmInput && (
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800 bg-gray-900">
              {error && <p className="text-red-400 text-[10px] mb-1">{error}</p>}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={userInput}
                  onChange={e => { setUserInput(e.target.value); setError(null) }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-gray-800 text-xs text-gray-100 rounded-full px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500/50 placeholder-gray-600"
                  disabled={isTyping}
                />
                <button
                  onClick={handleDmReply}
                  disabled={!userInput.trim() || isTyping}
                  className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center disabled:opacity-40 transition-all"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center border-t border-gray-800 bg-gray-900">
              <p className="text-xs text-gray-500">Qualification complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}