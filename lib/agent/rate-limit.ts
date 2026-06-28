interface WindowState {
  count: number
  startedAt: number
}

export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, WindowState>()
  private operations = 0

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  take(key: string, now = Date.now()): boolean {
    this.operations += 1
    if (this.operations % 250 === 0) this.prune(now)

    const current = this.windows.get(key)
    if (!current || now - current.startedAt >= this.windowMs) {
      this.windows.set(key, { count: 1, startedAt: now })
      return true
    }

    if (current.count >= this.limit) return false
    current.count += 1
    return true
  }

  private prune(now: number) {
    for (const [key, state] of this.windows) {
      if (now - state.startedAt >= this.windowMs) this.windows.delete(key)
    }
  }
}

export function requestRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const address = forwarded?.split(",")[0]?.trim()
  return address || request.headers.get("x-real-ip") || "unknown"
}
