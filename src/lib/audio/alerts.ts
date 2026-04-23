let audioCtx: AudioContext | null = null

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

export function playShortBeep() {
  const ctx = getCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.value = 0.08
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.15)
}

export function playPhaseCompleteChime() {
  const ctx = getCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.value = 0.06
    osc.connect(gain)
    gain.connect(ctx.destination)
    const t = ctx.currentTime + i * 0.12
    osc.start(t)
    osc.stop(t + 0.18)
  })
}

export function vibratePulse(pattern: number | number[] = 120) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
