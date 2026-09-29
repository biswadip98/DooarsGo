// DooarsGo — lightweight sound cues (Web Audio API, no audio files to host).
// Mirrors how ride apps alert drivers/riders. Respects a mute flag in localStorage.

let ctx = null
function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  // Browsers suspend audio until a user gesture; resume when we can.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function soundEnabled() {
  try { return localStorage.getItem('dg_muted') !== '1' } catch (_) { return true }
}
export function setMuted(muted) {
  try { muted ? localStorage.setItem('dg_muted', '1') : localStorage.removeItem('dg_muted') } catch (_) {}
}

// Play a sequence of short tones. tones: [{freq, dur, type}]
function playTones(tones, gain = 0.15) {
  if (!soundEnabled()) return
  const c = getCtx()
  if (!c) return
  let t = c.currentTime
  for (const tone of tones) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = tone.type || 'sine'
    osc.frequency.value = tone.freq
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + tone.dur)
    osc.connect(g).connect(c.destination)
    osc.start(t)
    osc.stop(t + tone.dur)
    t += tone.dur
  }
}

// Named cues used across the app.
export const Sounds = {
  // New ride request lands for a driver — attention-grabbing double chime.
  request: () => playTones([
    { freq: 880, dur: 0.16, type: 'triangle' },
    { freq: 1175, dur: 0.22, type: 'triangle' },
  ], 0.2),

  // Driver accepted / match found — pleasant rising two-note.
  matched: () => playTones([
    { freq: 660, dur: 0.14 },
    { freq: 990, dur: 0.22 },
  ], 0.18),

  // Ride completed — happy three-note flourish.
  complete: () => playTones([
    { freq: 660, dur: 0.14 },
    { freq: 880, dur: 0.14 },
    { freq: 1320, dur: 0.3 },
  ], 0.2),

  // Generic soft tap/confirm.
  tap: () => playTones([{ freq: 520, dur: 0.1 }], 0.12),
}

// Optional: also buzz the phone if the browser allows (drivers often keep it in a pocket).
export function buzz(pattern = [120]) {
  try { navigator.vibrate && navigator.vibrate(pattern) } catch (_) {}
}
