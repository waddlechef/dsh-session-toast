const ROUTE_REFUSAL = 'request refused: this route answers same-origin loopback only'
const ROUTE_PATH = '/dsh-session-toast/summary'
const MAX_TITLE = 80
const MAX_SUMMARY = 220
const MAX_ERROR = 200

export function apply(ctx) {
  if (typeof ctx.inject !== 'function') return

  ctx.inject(['webServer'], (scope) => {
    try {
      scope.webServer.register({
        name: 'dsh-session-toast-summary',
        kind: 'exact',
        path: ROUTE_PATH,
        handler: (req, res) => handleSummary(ctx, req, res),
      })
    } catch (error) {
      console.error(`[dsh-session-toast] summary route skipped: ${messageOf(error)}`)
    }
  })
}

function handleSummary(ctx, req, res) {
  if (!isTrustedRequest(req)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
    res.end(ROUTE_REFUSAL)
    return
  }
  if (req.method !== 'GET') {
    res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
    res.end()
    return
  }
  let url
  try {
    url = new URL(req.url || '/', 'http://localhost')
  } catch {
    respond(res, 400, { ok: false, plugin: 'dsh-session-toast', reason: 'bad-url' })
    return
  }
  const sessionId = url.searchParams.get('sessionId')

  if (sessionId === null || sessionId === '') {
    respond(res, 200, { ok: true, plugin: 'dsh-session-toast', version: 1 })
    return
  }
  const sessions = ctx.get ? ctx.get('sessions') : undefined
  const session = sessions && typeof sessions.get === 'function' ? sessions.get(sessionId) : undefined
  if (session === undefined) {

    respond(res, 200, { ok: false, plugin: 'dsh-session-toast', reason: 'session-not-found' })
    return
  }
  try {
    respond(res, 200, { ok: true, plugin: 'dsh-session-toast', ...summarize(ctx, session) })
  } catch (error) {
    respond(res, 200, {
      ok: false,
      plugin: 'dsh-session-toast',
      reason: 'summarize-failed',
      error: messageOf(error),
    })
  }
}

function respond(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

function summarize(ctx, session) {
  const header = session.header || {}
  const events = readEvents(session)
  const subagent = header.origin === 'subagent' || (header.delegationDepth || 0) > 0
  const endEvent = findLast(events, (event) => event && event.type === 'turn/end')
  const turn = endEvent && endEvent.data ? endEvent.data.turn : undefined
  const startEvent =
    turn === undefined
      ? undefined
      : findLast(events, (event) => event && event.type === 'turn/start' && event.data && event.data.turn === turn)
  const assistantEvent =
    turn === undefined
      ? findLast(events, (event) => event && event.type === 'assistant/message')
      : findLast(events, (event) => event && event.type === 'assistant/message' && event.data && event.data.turn === turn)
  const assistantMessage = assistantEvent && assistantEvent.data ? assistantEvent.data.message : undefined
  const fallbackAssistant =
    assistantEvent === undefined
      ? undefined
      : findLast(events, (event) => event && event.type === 'assistant/message')
  const reply =
    textOfMessage(assistantMessage) ||
    textOfMessage(fallbackAssistant && fallbackAssistant.data ? fallbackAssistant.data.message : undefined)

  const reason = endEvent && endEvent.data ? endEvent.data.reason : undefined
  const status = reason && typeof reason.kind === 'string' ? reason.kind : 'unknown'
  const error = errorOf(reason)
  const startedAt = startEvent && typeof startEvent.time === 'number' ? startEvent.time : undefined
  const finishedAt = endEvent && typeof endEvent.time === 'number' ? endEvent.time : undefined
  const durationMs = startedAt !== undefined && finishedAt !== undefined ? Math.max(0, finishedAt - startedAt) : 0

  let title = ''
  const titles = ctx.get ? ctx.get('sessionTitle') : undefined
  if (titles && typeof titles.get === 'function') {
    try {
      const snapshot = titles.get(session)
      if (snapshot && typeof snapshot.title === 'string') title = snapshot.title
    } catch {

    }
  }
  if (title === '') {
    const firstUser = findFirst(events, (event) => event && event.type === 'user/message')
    if (firstUser) title = textOfMessage(firstUser.data)
  }

  return {
    title: truncate(cleanText(title), MAX_TITLE),
    summary: truncate(cleanText(reply), MAX_SUMMARY),
    status,
    error: truncate(cleanText(error), MAX_ERROR),
    interrupted: Boolean(assistantEvent && assistantEvent.data && assistantEvent.data.interrupted),
    turn: typeof turn === 'number' ? turn : null,
    durationMs,
    subagent,
    updatedAt: finishedAt !== undefined ? finishedAt : Date.now(),
  }
}

function readEvents(session) {
  try {
    if (typeof session.ownEvents === 'function') {
      const events = session.ownEvents()
      return Array.isArray(events) ? events : []
    }
    if (typeof session.snapshotEvents === 'function') {
      const events = session.snapshotEvents()
      return Array.isArray(events) ? events : []
    }
    if (Array.isArray(session.events)) return session.events
  } catch (error) {
    console.error(`[dsh-session-toast] session events unavailable: ${messageOf(error)}`)
  }
  return []
}

function findLast(items, predicate) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    if (predicate(item)) return item
  }
  return undefined
}

function findFirst(items, predicate) {
  for (const item of items) if (predicate(item)) return item
  return undefined
}

function textOfMessage(message) {
  if (message === undefined || message === null) return ''
  const content = message.content
  if (!Array.isArray(content)) return ''
  const parts = []
  for (const block of content) {
    if (block && block.type === 'text' && typeof block.text === 'string' && block.text !== '') {
      parts.push(block.text)
    }
  }
  return parts.join('\n')
}

function errorOf(reason) {
  if (!reason || typeof reason !== 'object') return ''
  if (reason.kind === 'error' && reason.error && typeof reason.error.message === 'string') {
    return reason.error.message
  }
  if (reason.kind === 'aborted' && reason.reason && typeof reason.reason === 'object') {
    const cause = reason.reason.kind
    if (cause === 'user') return 'stopped by user'
    if (cause === 'parent') return 'stopped by parent'
    if (cause === 'disposed') return 'session disposed'
    if (cause === 'hook' && typeof reason.reason.reason === 'string') return reason.reason.reason
  }
  return ''
}

function cleanText(text) {
  if (typeof text !== 'string') return ''
  return text.replace(/\s+/gu, ' ').trim()
}

function truncate(text, limit) {
  if (typeof text !== 'string' || text === '') return ''
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1))}…`
}

function messageOf(error) {
  if (error === undefined || error === null) return 'unknown error'
  if (typeof error === 'string') return error
  if (typeof error.message === 'string') return error.message
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function isLoopbackHost(hostname) {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4 && parts[0] === '127' && parts.every((part) => /^\d{1,3}$/u.test(part) && Number(part) <= 255)
}

function isTrustedRequest(req) {
  const host = req.headers ? req.headers.host : undefined
  if (typeof host !== 'string' || host === '') return false
  let hostUrl
  try {
    hostUrl = new URL(`http://${host}`)
  } catch {
    return false
  }
  if (!isLoopbackHost(hostUrl.hostname)) return false
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}
