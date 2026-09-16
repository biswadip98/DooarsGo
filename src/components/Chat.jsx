import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

// role: 'rider' | 'driver'
export default function Chat({ rideId, role }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    let channel
    async function init() {
      const { data } = await supabase
        .from('ride_messages')
        .select('*')
        .eq('ride_id', rideId)
        .order('created_at')
      setMessages(data || [])
      channel = supabase
        .channel('msg-' + rideId)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `ride_id=eq.${rideId}` },
          (p) => setMessages((m) => [...m, p.new])
        )
        .subscribe()
    }
    init()
    return () => channel && supabase.removeChannel(channel)
  }, [rideId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(body) {
    const b = (body ?? text).trim()
    if (!b) return
    setText('')
    await supabase.from('ride_messages').insert({
      ride_id: rideId,
      sender_id: user.id,
      sender_role: role,
      body: b,
    })
  }

  const quick = ['On my way', '2 min', 'Where are you?', 'Reached']

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-3 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
      <div className="text-xs font-semibold text-ink/50 mb-2">Messages</div>
      <div className="max-h-40 overflow-auto space-y-2 mb-2">
        {messages.length === 0 && <div className="text-xs text-ink/40 text-center py-2">Say hello 👋</div>}
        {messages.map((m) => {
          const mine = m.sender_id === user.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`px-3 py-2 text-xs max-w-[80%] ${
                  mine
                    ? 'bg-leafbright/15 rounded-l-xl rounded-tr-xl'
                    : 'bg-mist rounded-r-xl rounded-tl-xl'
                }`}
              >
                {m.body}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {quick.map((q) => (
          <button key={q} onClick={() => send(q)} className="text-[11px] bg-mist rounded-full px-2.5 py-1 text-ink/70">
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-mist bg-mist/30 px-3 py-2 text-sm outline-none focus:border-leafbright"
        />
        <button onClick={() => send()} className="rounded-xl bg-forest text-white text-sm font-semibold px-4">
          Send
        </button>
      </div>
    </div>
  )
}
