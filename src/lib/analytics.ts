export function trackEvent(event: string, payload: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return

    try {
        const key = 'campfire_events'
        const raw = localStorage.getItem(key)
        const existing = raw ? JSON.parse(raw) : []
        existing.push({ event, payload, ts: Date.now() })
        localStorage.setItem(key, JSON.stringify(existing.slice(-200)))
    } catch {
    }
}
