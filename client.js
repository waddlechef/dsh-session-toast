window.__ModuleLoader__.load({
  id: 'dsh-session-toast',
  factory: function (require) {
    'use strict'
    var React = require('react')
    var h = React.createElement

    var TOAST_ID = 'dsh-session-toast-stack'
    var SETTINGS_SECTION_ID = 'dsh-session-toast-settings'
    var STORAGE_KEY = 'dsh.session-toast.settings.v2'
    var LEGACY_STORAGE_KEY = 'dsh.session-notify.settings.v1'
    var PREVIOUS_STORAGE_KEY = 'dsh.session-notify.settings.v2'
    var DEFAULT_KEY = 'dsh.session-toast.defaults.v1'
    var PREVIOUS_DEFAULT_KEY = 'dsh.session-notify.defaults.v1'
    var SUMMARY_PATH = '/dsh-session-toast/summary'
    var TOAST_LIFETIME_MS = 9000
    var TOAST_LIMIT = 4

    var DICT = {
      en: {
        nav: 'Session notifications',
        title: 'Session notifications',
        subtitle: 'Get a notice when a session finishes a reply; failures look different.',
        enable: 'Enable notifications',
        enableHint: 'Turn off to stop all notices.',
        sound: 'Play a sound',
        soundHint: 'A chime on completion; failures use another tone.',
        width: 'Notice width',
        widthHint: 'Card width in pixels.',
        height: 'Notice height',
        heightHint: 'Card height in pixels; small values hide the excerpt first.',
        radius: 'Corner radius',
        radiusHint: 'Card corner radius in pixels.',
        shadow: 'Shadow radius',
        shadowHint: 'Card shadow radius in pixels; 0 removes it.',
        offsetBottom: 'Bottom margin',
        offsetBottomHint: 'Distance from the window bottom, in pixels.',
        offsetRight: 'Right margin',
        offsetRightHint: 'Distance from the window right edge, in pixels.',
        dnd: 'Do not disturb',
        dndHint: 'No notices during this daily window.',
        dndFrom: 'From',
        dndTo: 'To',
        test: 'Send a test notification',
        testHint: 'Preview it now; ignores the master switch and quiet hours.',
        defaults: 'Defaults',
        defaultsHint: 'Save your current values as this browser\'s defaults, or restore them.',
        saveDefault: 'Save current',
        resetDefault: 'Restore',
        saveDefaultDone: 'Saved as the default.',
        resetDefaultDone: 'Defaults restored.',
        testTitle: 'Test notification',
        testSummary: 'If you can read this, notices and sound work.',
        noSummary: 'Finished without a text reply.',
        openHint: 'Click to open the session',
        close: 'Dismiss',
        completed: 'Completed',
        failed: 'Failed',
        stopped: 'Stopped',
        interrupted: 'Interrupted',
        truncated: 'Length limit reached',
        blocked: 'Blocked',
        unknown: 'Finished',
      },
      zh: {
        nav: '会话通知',
        title: '会话通知',
        subtitle: '会话回复结束时提醒你；失败会单独提示。',
        enable: '启用通知',
        enableHint: '关闭后不再提醒。',
        sound: '播放提示音',
        soundHint: '完成时播放提示音，失败音调不同。',
        width: '通知宽度',
        widthHint: '通知卡宽度，单位像素。',
        height: '通知高度',
        heightHint: '通知卡高度，单位像素；太小时先隐藏摘要。',
        radius: '圆角半径',
        radiusHint: '卡片圆角半径，单位像素。',
        shadow: '阴影半径',
        shadowHint: '卡片阴影半径，单位像素；0 为无阴影。',
        offsetBottom: '底部边距',
        offsetBottomHint: '通知与窗口底部的距离，单位像素。',
        offsetRight: '右侧边距',
        offsetRightHint: '通知与窗口右侧的距离，单位像素。',
        dnd: '免打扰',
        dndHint: '该时间段内不提醒。',
        dndFrom: '开始',
        dndTo: '结束',
        test: '发送测试通知',
        testHint: '立即预览效果，不受总开关和免打扰限制。',
        defaults: '默认值',
        defaultsHint: '把当前设置保存为默认值，之后可一键恢复。',
        saveDefault: '保存为默认',
        resetDefault: '恢复默认',
        saveDefaultDone: '已把当前设置保存为默认值。',
        resetDefaultDone: '已恢复为默认值。',
        testTitle: '测试通知',
        testSummary: '能看到这条，说明通知和声音都正常。',
        noSummary: '已完成，没有文字回复。',
        openHint: '点击打开会话',
        close: '关闭',
        completed: '已完成',
        failed: '失败',
        stopped: '已停止',
        interrupted: '已中断',
        truncated: '达到长度上限',
        blocked: '被阻止',
        unknown: '已结束',
      },
    }

    var langRef = { read: function () { return documentLang() } }

    function documentLang() {
      try {
        var el = document.documentElement
        return (el && el.lang) || (navigator && navigator.language) || 'en'
      } catch (error) {
        return 'en'
      }
    }

    function dictFor(lang) {
      return String(lang || 'en').toLowerCase().indexOf('zh') === 0 ? DICT.zh : DICT.en
    }

    function t(key) {
      var value = dictFor(langRef.read())[key]
      if (typeof value === 'string') return value
      var fallback = DICT.en[key]
      return typeof fallback === 'string' ? fallback : key
    }

    function statusText(status) {
      if (status === 'error') return t('failed')
      if (status === 'aborted') return t('stopped')
      if (status === 'interrupted') return t('interrupted')
      if (status === 'max-tokens') return t('truncated')
      if (status === 'blocked') return t('blocked')
      if (status === 'completed') return t('completed')
      return t('unknown')
    }

    var DEFAULT_WIDTH = 380
    var DEFAULT_HEIGHT = 140
    var MIN_WIDTH = 240
    var MAX_WIDTH = 720
    var MIN_HEIGHT = 48
    var MAX_HEIGHT = 320
    var MIN_OFFSET = 0
    var MAX_OFFSET = 240
    var DEFAULT_OFFSET_BOTTOM = 28
    var DEFAULT_OFFSET_RIGHT = 24
    var MIN_RADIUS = 0
    var MAX_RADIUS = 24
    var DEFAULT_RADIUS = 10
    var MIN_SHADOW = 0
    var MAX_SHADOW = 32
    var DEFAULT_SHADOW = 8

    function builtinSettings() {
      return {
        version: 2,
        enabled: true,
        sound: true,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        radius: DEFAULT_RADIUS,
        shadow: DEFAULT_SHADOW,
        offsetBottom: DEFAULT_OFFSET_BOTTOM,
        offsetRight: DEFAULT_OFFSET_RIGHT,
        dnd: { enabled: false, start: '22:00', end: '08:00' },
      }
    }

    function readUserDefaults() {
      try {
        var raw = window.localStorage.getItem(DEFAULT_KEY)
        if (typeof raw === 'string' && raw !== '') return JSON.parse(raw)

        var previous = window.localStorage.getItem(PREVIOUS_DEFAULT_KEY)
        if (typeof previous === 'string' && previous !== '') {
          var parsed = JSON.parse(previous)
          window.localStorage.setItem(DEFAULT_KEY, JSON.stringify(parsed))
          window.localStorage.removeItem(PREVIOUS_DEFAULT_KEY)
          return parsed
        }
      } catch (error) {

      }
      return null
    }

    function defaultSettings() {
      var base = builtinSettings()
      var custom = readUserDefaults()
      if (custom === null || typeof custom !== 'object') return base
      return normalizeSettings(custom, base)
    }

    function saveUserDefaults(settings) {
      try {
        window.localStorage.setItem(DEFAULT_KEY, JSON.stringify(normalizeSettings(settings)))
      } catch (error) {

      }
    }

    function validClock(value, fallback) {
      return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/u.test(value) ? value : fallback
    }

    function clampNumber(value, fallback, min, max) {
      var number = typeof value === 'number' ? value : Number(value)
      if (typeof number !== 'number' || !isFinite(number)) return fallback
      return Math.min(max, Math.max(min, Math.round(number)))
    }

    function normalizeSettings(raw, base) {
      var fallback = base || defaultSettings()
      if (raw === null || typeof raw !== 'object') return fallback
      var dnd = raw.dnd !== null && typeof raw.dnd === 'object' ? raw.dnd : {}
      return {
        version: 2,
        enabled: raw.enabled !== false,
        sound: raw.sound !== false,
        width: clampNumber(raw.width, fallback.width, MIN_WIDTH, MAX_WIDTH),
        height: clampNumber(raw.height, fallback.height, MIN_HEIGHT, MAX_HEIGHT),
        radius: clampNumber(raw.radius, fallback.radius, MIN_RADIUS, MAX_RADIUS),
        shadow: clampNumber(raw.shadow, fallback.shadow, MIN_SHADOW, MAX_SHADOW),
        offsetBottom: clampNumber(raw.offsetBottom, fallback.offsetBottom, MIN_OFFSET, MAX_OFFSET),
        offsetRight: clampNumber(raw.offsetRight, fallback.offsetRight, MIN_OFFSET, MAX_OFFSET),
        dnd: {
          enabled: dnd.enabled === true,
          start: validClock(dnd.start, fallback.dnd.start),
          end: validClock(dnd.end, fallback.dnd.end),
        },
      }
    }

    function createSettingsSource() {
      var value = defaultSettings()
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY)
        if (typeof raw === 'string' && raw !== '') {
          value = normalizeSettings(JSON.parse(raw))
        } else {

          var previous = window.localStorage.getItem(PREVIOUS_STORAGE_KEY)
          var legacy = previous === null ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : previous
          if (typeof legacy === 'string' && legacy !== '') {
            value = normalizeSettings(JSON.parse(legacy))
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
            window.localStorage.removeItem(PREVIOUS_STORAGE_KEY)
            window.localStorage.removeItem(LEGACY_STORAGE_KEY)
          }
        }
      } catch (error) {
        value = defaultSettings()
      }

      try {
        if (readUserDefaults() === null && window.localStorage.getItem(STORAGE_KEY) !== null) {
          saveUserDefaults(value)
        }
      } catch (error) {

      }
      var listeners = new Set()
      return {
        getSnapshot: function () {
          return value
        },
        subscribe: function (listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        update: function (patch) {
          var next = Object.assign({}, value, patch || {})
          if (patch && patch.dnd) next.dnd = Object.assign({}, value.dnd, patch.dnd)
          value = normalizeSettings(next)
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
          } catch (error) {

          }
          listeners.forEach(function (listener) {
            try {
              listener()
            } catch (error) {

            }
          })
        },
      }
    }

    function parseClock(value) {
      var match = /^(\d{2}):(\d{2})$/u.exec(typeof value === 'string' ? value : '')
      if (match === null) return null
      return Number(match[1]) * 60 + Number(match[2])
    }

    function isDndActive(settings, now) {
      var dnd = settings && settings.dnd
      if (!dnd || dnd.enabled !== true) return false
      var from = parseClock(dnd.start)
      var to = parseClock(dnd.end)
      if (from === null || to === null || from === to) return false
      var date = now instanceof Date ? now : new Date()
      var current = date.getHours() * 60 + date.getMinutes()
      return from < to ? current >= from && current < to : current >= from || current < to
    }

    function createTickStore() {
      var value = 0
      var listeners = new Set()
      return {
        getSnapshot: function () {
          return value
        },
        subscribe: function (listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        bump: function () {
          value += 1
          listeners.forEach(function (listener) {
            try {
              listener()
            } catch (error) {

            }
          })
        },
      }
    }

    function createBus() {
      var listeners = new Set()
      return {
        subscribe: function (listener) {
          listeners.add(listener)
          return function () {
            listeners.delete(listener)
          }
        },
        emit: function (payload) {
          listeners.forEach(function (listener) {
            try {
              listener(payload)
            } catch (error) {

            }
          })
        },
      }
    }

    function useStore(source) {
      if (typeof React.useSyncExternalStore === 'function') {
        return React.useSyncExternalStore(source.subscribe, source.getSnapshot)
      }
      var state = React.useState(source.getSnapshot())
      React.useEffect(function () {
        var off = source.subscribe(function () {
          state[1](source.getSnapshot())
        })
        return typeof off === 'function' ? off : function () {}
      }, [source])
      return state[0]
    }

    var audioState = { ctx: null }

    function audioContext() {
      if (audioState.ctx !== null) return audioState.ctx
      var Ctor = window.AudioContext || window.webkitAudioContext
      if (typeof Ctor !== 'function') return null
      try {
        audioState.ctx = new Ctor()
      } catch (error) {
        audioState.ctx = null
      }
      return audioState.ctx
    }

    function primeAudio() {
      var ctx = audioContext()
      if (!ctx) return
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        try {
          var pending = ctx.resume()
          if (pending && typeof pending.catch === 'function') pending.catch(function () {})
        } catch (error) {

        }
      }
    }

    function playChime(kind) {
      var ctx = audioContext()
      if (!ctx) return
      if (ctx.state !== 'running') primeAudio()
      if (ctx.state !== 'running') return
      try {
        var tones =
          kind === 'error'
            ? [
                [392, 0],
                [311.13, 0.17],
              ]
            : [
                [783.99, 0],
                [1046.5, 0.14],
              ]
        var base = ctx.currentTime + 0.01
        for (var index = 0; index < tones.length; index += 1) {
          var frequency = tones[index][0]
          var offset = tones[index][1]
          var oscillator = ctx.createOscillator()
          var gain = ctx.createGain()
          var start = base + offset
          oscillator.type = 'sine'
          oscillator.frequency.value = frequency
          gain.gain.setValueAtTime(0.0001, start)
          gain.gain.exponentialRampToValueAtTime(kind === 'error' ? 0.09 : 0.06, start + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22)
          oscillator.connect(gain)
          gain.connect(ctx.destination)
          oscillator.start(start)
          oscillator.stop(start + 0.24)
        }
      } catch (error) {

      }
    }

    function fetchJson(url) {
      if (typeof window.fetch !== 'function') return Promise.resolve(null)
      return window
        .fetch(url, { headers: { accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (response) {
          if (!response || !response.ok) return null
          return response.json().catch(function () {
            return null
          })
        })
        .catch(function () {
          return null
        })
    }

    function fetchSummary(sessionId) {
      if (typeof sessionId !== 'string' || sessionId === '') return Promise.resolve(null)
      return fetchJson(SUMMARY_PATH + '?sessionId=' + encodeURIComponent(sessionId)).then(function (body) {
        if (!body || body.ok !== true || body.plugin !== 'dsh-session-toast') return null
        return body
      })
    }

    function clockText(milliseconds) {
      var date = new Date(milliseconds)
      var hours = String(date.getHours())
      var minutes = String(date.getMinutes())
      return (hours.length < 2 ? '0' + hours : hours) + ':' + (minutes.length < 2 ? '0' + minutes : minutes)
    }

    var CODE_STYLE = {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '11.5px',
      padding: '0 3px',
      borderRadius: '3px',
      background: 'rgba(127, 127, 127, 0.16)',
    }

    function markdownSegment(text) {
      return text.replace(/\*\*|`|~~/gu, '')
    }

    function inlineMarkdown(text, keyPrefix) {
      var pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[([^\]\n]+)\]\([^)\s]+\))/gu
      var nodes = []
      var cursor = 0
      var counter = 0
      var match = pattern.exec(text)
      while (match !== null) {
        if (match.index > cursor) nodes.push(markdownSegment(text.slice(cursor, match.index)))
        var token = match[0]
        var key = keyPrefix + ':' + counter
        if (token.charAt(0) === '`') {
          nodes.push(h('code', { key: key, style: CODE_STYLE }, markdownSegment(token.slice(1, -1))))
        } else if (token.indexOf('**') === 0) {
          nodes.push(
            h(
              'strong',
              { key: key, style: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)' } },
              markdownSegment(token.slice(2, -2)),
            ),
          )
        } else if (token.charAt(0) === '*') {
          nodes.push(h('em', { key: key }, markdownSegment(token.slice(1, -1))))
        } else {
          nodes.push(markdownSegment(match[2]))
        }
        cursor = pattern.lastIndex
        counter += 1
        match = pattern.exec(text)
      }
      if (cursor < text.length) nodes.push(markdownSegment(text.slice(cursor)))
      if (nodes.length === 0) return [markdownSegment(text)]
      return nodes
    }

    function summaryNodes(text) {
      if (typeof text !== 'string' || text === '') return []
      var lines = text.replace(/\r\n?/gu, '\n').split('\n')
      var nodes = []
      var inFence = false
      for (var index = 0; index < lines.length; index += 1) {
        var trimmed = lines[index].trim()
        if (/^```/u.test(trimmed)) {
          inFence = !inFence
          continue
        }
        if (trimmed === '') continue
        var line = trimmed
        if (!inFence) {
          if (/^(-{3,}|\*{3,}|_{3,})$/u.test(line)) continue
          if (/^\|?\s*:?-{2,}[\s:|-]*$/u.test(line)) continue
          line = line.replace(/^#{1,6}\s+/u, '')
          line = line.replace(/^>\s?/u, '')
          line = line.replace(/^[-*+]\s+/u, '• ')
          if (line.indexOf('|') !== -1) {
            var cells = line.split('|').map(function (part) {
              return part.trim()
            })
            cells = cells.filter(function (part) {
              if (part === '') return false
              if (/^:?-{2,}:?$/u.test(part)) return false
              return true
            })
            if (cells.length > 1) line = cells.join(' · ')
          }
        }
        if (nodes.length > 0) nodes.push(h('br', { key: 'br:' + index }))
        if (inFence) {
          nodes.push(h('code', { key: 'fence:' + index, style: CODE_STYLE }, line))
        } else {
          var parts = inlineMarkdown(line, 'line' + index)
          for (var part = 0; part < parts.length; part += 1) nodes.push(parts[part])
        }
      }
      return nodes
    }

    function statusIcon(kind, color) {
      if (kind === 'check') {
        return h('path', {
          d: 'M3.3 8.5l3.1 3.1 6.3-7.2',
          stroke: color,
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      }
      if (kind === 'pause') {
        return [
          h('path', { key: 'a', d: 'M6.3 4.6v6.8', stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
          h('path', { key: 'b', d: 'M9.7 4.6v6.8', stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
        ]
      }
      return [
        h('path', { key: 'a', d: 'M8 4.2v4.8', stroke: color, strokeWidth: 2, strokeLinecap: 'round' }),
        h('circle', { key: 'b', cx: 8, cy: 11.6, r: 1, fill: color }),
      ]
    }

    var CARD_PAD_BORDER_H = 25
    var CARD_HEADER_H = 20
    var CARD_META_H = 15
    var CARD_GAP = 7
    var CARD_BODY_LINE_H = 20

    function ToastCard(props) {
      var toast = props.toast
      var hoverState = React.useState(false)
      var hovered = hoverState[0]
      var setHovered = hoverState[1]
      var elapsedRef = React.useRef(0)
      var runStartRef = React.useRef(Date.now())
      var bodyRef = React.useRef(null)
      var clippedState = React.useState(false)
      var clipped = clippedState[0]

      React.useEffect(
        function () {
          var element = bodyRef.current
          var next = element === null ? false : element.scrollHeight > element.clientHeight + 1
          clippedState[1](function (current) {
            return current === next ? current : next
          })
        },
        [toast.key, props.width, props.height],
      )

      React.useEffect(
        function () {
          if (hovered) return undefined
          var remaining = Math.max(0, TOAST_LIFETIME_MS - elapsedRef.current)
          var timer = window.setTimeout(function () {
            props.onDismiss(toast.key)
          }, remaining)
          return function () {
            window.clearTimeout(timer)
          }
        },
        [hovered, toast.key, props.onDismiss],
      )

      function beginHover() {
        if (hovered) return
        elapsedRef.current += Date.now() - runStartRef.current
        setHovered(true)
      }

      function endHover() {
        runStartRef.current = Date.now()
        setHovered(false)
      }

      var error = toast.status === 'error'
      var warn =
        toast.status === 'aborted' ||
        toast.status === 'interrupted' ||
        toast.status === 'max-tokens' ||
        toast.status === 'blocked'
      var tone = error
        ? 'var(--dsw-alias-state-error-primary)'
        : warn
          ? 'var(--dsw-alias-state-warn-primary)'
          : 'var(--dsw-alias-state-success-primary)'
      var iconKind = error || warn ? (warn && !error ? 'pause' : 'alert') : 'check'
      var body = error && toast.error ? toast.error : toast.summary
      var showMeta = props.height >= CARD_PAD_BORDER_H + CARD_HEADER_H + CARD_GAP + CARD_META_H
      var bodySpace =
        props.height -
        (CARD_PAD_BORDER_H + CARD_HEADER_H + CARD_GAP + (showMeta ? CARD_META_H + CARD_GAP : 0))
      var bodyLines = Math.max(0, Math.floor(bodySpace / CARD_BODY_LINE_H))
      var leaving = toast.leaving === true
      var meta = [clockText(toast.at)]
      if (typeof toast.durationMs === 'number' && toast.durationMs >= 1000) {
        meta.push(Math.round(toast.durationMs / 1000) + 's')
      }
      if (toast.status !== 'completed' && toast.status !== 'unknown') meta.push(statusText(toast.status))

      var cardStyle = {
        pointerEvents: 'auto',
        cursor: toast.sessionId ? 'pointer' : 'default',
        position: 'relative',
        width: '100%',
        height: props.height + 'px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: (typeof props.radius === 'number' ? props.radius : DEFAULT_RADIUS) + 'px',
        boxShadow:
          typeof props.shadow === 'number' && props.shadow > 0
            ? '0 2px ' + props.shadow + 'px rgba(0, 0, 0, 0.10)'
            : 'none',
        padding: '11px 12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: CARD_GAP + 'px',
        fontFamily: 'inherit',
        fontSize: '13px',
        lineHeight: 1.5,
      }
      if (leaving) {
        cardStyle.opacity = 0
        cardStyle.transform = 'translateY(4px)'
        cardStyle.transition = 'opacity 130ms ease, transform 130ms ease'
      } else {
        cardStyle.animation = 'dsh-session-toast-in 160ms ease-out'
      }

      return h(
        'div',
        {
          role: 'status',
          tabIndex: toast.sessionId ? 0 : undefined,
          title: toast.sessionId ? t('openHint') : undefined,
          onClick: toast.sessionId ? props.onOpen : undefined,
          onKeyDown: toast.sessionId
            ? function (event) {

                if (event.target !== event.currentTarget) return
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                props.onOpen()
              }
            : undefined,
          onMouseEnter: function () {
            beginHover()
          },
          onMouseLeave: function () {
            endHover()
          },
          onFocus: function () {
            beginHover()
          },
          onBlur: function (event) {

            if (event.currentTarget.contains(event.relatedTarget)) return
            endHover()
          },
          style: cardStyle,
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'flex-start', gap: '8px' } },
          h(
            'svg',
            {
              width: 16,
              height: 16,
              viewBox: '0 0 16 16',
              fill: 'none',
              'aria-hidden': true,
              style: { flex: '0 0 auto', marginTop: '2px' },
            },
            statusIcon(iconKind, tone),
          ),
          h(
            'span',
            {
              style: {
                flex: '1 1 auto',
                minWidth: 0,
                fontWeight: 600,
                color: error || warn ? tone : 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            },
            toast.title || t('unknown'),
          ),
          h(
            'button',
            {
              type: 'button',
              'aria-label': t('close'),
              tabIndex: hovered ? 0 : -1,
              onClick: function (event) {
                event.stopPropagation()
                props.onDismiss(toast.key)
              },
              style: {
                appearance: 'none',
                flex: '0 0 auto',
                width: '24px',
                height: '24px',
                marginTop: '-4px',
                marginRight: '-6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 0,
                borderRadius: '6px',
                background: 'transparent',
                color: 'var(--dsw-alias-label-secondary)',
                cursor: 'pointer',
                font: 'inherit',
                fontSize: '15px',
                lineHeight: 1,
                opacity: hovered ? 1 : 0,
                transition: 'opacity 120ms ease',
                pointerEvents: hovered ? 'auto' : 'none',
              },
            },
            '×',
          ),
        ),
        body && bodyLines > 0
          ? h(
              'div',
              {
                ref: bodyRef,

                style: {
                  position: 'relative',
                  flex: '0 0 auto',
                  height: bodyLines * CARD_BODY_LINE_H + 'px',
                  overflow: 'hidden',
                  color: 'var(--dsw-alias-label-secondary)',
                  fontSize: '12.5px',
                  lineHeight: CARD_BODY_LINE_H + 'px',
                  wordBreak: 'break-word',
                },
              },
              summaryNodes(body),
              clipped
                ? h('div', {
                    key: 'fade',
                    'aria-hidden': true,
                    style: {
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: '56px',
                      height: CARD_BODY_LINE_H + 'px',
                      background: 'linear-gradient(to right, transparent, var(--dsw-alias-bg-layer-2) 78%)',
                      pointerEvents: 'none',
                    },
                  })
                : null,
            )
          : null,
        showMeta
          ? h(
              'div',
              {
                style: {
                  flex: '0 0 auto',
                  marginTop: 'auto',
                  color: 'var(--dsw-alias-label-secondary)',
                  fontSize: '11px',
                  lineHeight: CARD_META_H + 'px',
                  opacity: 0.6,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              },
              meta.join(' · '),
            )
          : null,
        h('div', {
          key: 'progress',
          'aria-hidden': true,
          style: {
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '2px',
            width: '100%',
            background: tone,
            opacity: 0.5,
            animation: 'dsh-session-toast-bar ' + TOAST_LIFETIME_MS + 'ms linear forwards',
            animationDelay: '-' + elapsedRef.current + 'ms',
            animationPlayState: hovered ? 'paused' : 'running',
          },
        }),
      )
    }

    function createNotifier(deps) {
      return function NotifierOverlay(props) {
        var settings = useStore(deps.settingsSource)
        useStore(deps.tickStore)
        var toastsState = React.useState([])
        var toasts = toastsState[0]
        var setToasts = toastsState[1]
        var keyRef = React.useRef(0)
        var prevRef = React.useRef(null)
        var settingsRef = React.useRef(settings)
        settingsRef.current = settings

        var rows = props.useSessions(function (snapshot) {
          return snapshot ? snapshot.byId : undefined
        })
        var phase = props.useSessions(function (snapshot) {
          return snapshot ? snapshot.phase : undefined
        })

        var pushToast = React.useCallback(
          function (toast, forceSound) {
            keyRef.current += 1
            var entry = Object.assign({ key: 'notice-' + keyRef.current, at: Date.now() }, toast)
            setToasts(function (list) {
              return list.concat([entry]).slice(-TOAST_LIMIT)
            })
            if (forceSound === true || settingsRef.current.sound === true) {
              playChime(entry.status === 'error' ? 'error' : 'ok')
            }
          },
          [setToasts],
        )

        var dismiss = React.useCallback(
          function (key) {
            setToasts(function (list) {
              return list.map(function (item) {
                return item.key === key && item.leaving !== true ? Object.assign({}, item, { leaving: true }) : item
              })
            })
            window.setTimeout(function () {
              setToasts(function (list) {
                return list.filter(function (item) {
                  return item.key !== key
                })
              })
            }, 140)
          },
          [setToasts],
        )

        React.useEffect(function () {
          return deps.bus.subscribe(function (payload) {
            pushToast(
              {
                sessionId: '',
                title: payload.title,
                summary: payload.summary,
                status: 'completed',
                error: '',
                durationMs: 0,
              },
              true,
            )
          })
        }, [pushToast])

        React.useEffect(
          function () {
            if (!rows || typeof rows !== 'object') return
            var current = new Map()
            var ids = Object.keys(rows)
            for (var index = 0; index < ids.length; index += 1) {
              var row = rows[ids[index]]
              current.set(ids[index], Boolean(row && row.running))
            }
            var previous = prevRef.current
            prevRef.current = current
            if (previous === null || phase !== 'ready') return
            var finished = []
            current.forEach(function (running, id) {
              if (previous.get(id) === true && running === false) finished.push(id)
            })
            if (finished.length === 0) return
            var active = settingsRef.current
            if (active.enabled !== true) return
            if (isDndActive(active)) return
            finished.forEach(function (sessionId) {
              fetchSummary(sessionId).then(function (payload) {
                if (payload && payload.subagent === true) return
                var rowSnapshot = rows[sessionId] || {}
                var status = payload && typeof payload.status === 'string' ? payload.status : 'completed'
                var title =
                  (payload && typeof payload.title === 'string' && payload.title) ||
                  (typeof rowSnapshot.title === 'string' && rowSnapshot.title) ||
                  sessionId
                var body = payload && typeof payload.summary === 'string' ? payload.summary : ''
                if (body === '' && payload && typeof payload.error === 'string' && payload.error !== '') {
                  body = payload.error
                }
                pushToast({
                  sessionId: sessionId,
                  title: title,
                  summary: body === '' ? t('noSummary') : body,
                  error: payload && typeof payload.error === 'string' ? payload.error : '',
                  status: status,
                  durationMs: payload && typeof payload.durationMs === 'number' ? payload.durationMs : 0,
                })
              })
            })
          },
          [rows, phase, pushToast],
        )

        if (toasts.length === 0) return null
        var cards = toasts.map(function (toast) {
          return h(ToastCard, {
            key: toast.key,
            toast: toast,
            height: settings.height,
            radius: settings.radius,
            shadow: settings.shadow,
            onDismiss: dismiss,
            onOpen: function () {
              deps.openSession(toast.sessionId)
              dismiss(toast.key)
            },
          })
        })
        return h(
          'div',
          {
            'aria-live': 'polite',
            style: {
              position: 'fixed',
              bottom: settings.offsetBottom + 'px',
              right: settings.offsetRight + 'px',
              zIndex: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
              width: settings.width + 'px',
              maxWidth: 'calc(100vw - ' + (settings.offsetRight + 12) + 'px)',
              pointerEvents: 'none',
            },
          },
          h(
            'style',
            { key: 'style' },
            '@keyframes dsh-session-toast-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}@keyframes dsh-session-toast-bar{from{width:100%}to{width:0}}',
          ),
          cards,
        )
      }
    }

    function Switch(props) {
      var checked = props.checked === true
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': checked,
          'aria-label': props.label,
          onClick: function () {
            props.onChange(!checked)
          },
          style: {
            appearance: 'none',
            flex: '0 0 auto',
            border: 0,
            cursor: 'pointer',
            width: '40px',
            height: '24px',
            borderRadius: '999px',
            padding: '2px',
            background: checked ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-bg-layer-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: checked ? 'flex-end' : 'flex-start',
            transition: 'background 160ms ease',
          },
        },
        h('span', {
          style: {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--dsw-alias-bg-base)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
            display: 'block',
          },
        }),
      )
    }

    function settingRow(label, hint, control) {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            padding: '13px 0',
            borderTop: '1px solid var(--dsw-alias-border-l1)',
          },
        },
        h(
          'div',
          { style: { flex: '1 1 auto', minWidth: 0 } },
          h('div', { style: { fontSize: '13px', fontWeight: 500 } }, label),
          hint ? h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5, marginTop: '2px' } }, hint) : null,
        ),
        control,
      )
    }

    function sizeControl(label, value, min, max, step, onChange) {
      return h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' } },
        h('input', {
          type: 'range',
          min: min,
          max: max,
          step: step,
          value: value,
          'aria-label': label,
          onChange: function (event) {
            onChange(Number(event.target.value))
          },
          style: { width: '150px', accentColor: 'var(--dsw-alias-brand-primary)', cursor: 'pointer' },
        }),
        h(
          'span',
          {
            style: {
              width: '54px',
              textAlign: 'right',
              fontSize: '12px',
              color: 'var(--dsw-alias-label-secondary)',
              fontVariantNumeric: 'tabular-nums',
            },
          },
          value + ' px',
        ),
      )
    }

    function actionButton(label, onClick) {
      return h(
        'button',
        {
          type: 'button',
          onClick: onClick,
          style: {
            appearance: 'none',
            flex: '0 0 auto',
            cursor: 'pointer',
            padding: '7px 14px',
            borderRadius: '9px',
            background: 'var(--dsw-alias-bg-layer-2)',
            color: 'var(--dsw-alias-label-primary)',
            border: '1px solid var(--dsw-alias-border-l1)',
            font: 'inherit',
            fontSize: '13px',
            fontWeight: 500,
          },
        },
        label,
      )
    }

    function createSettingsPage(deps) {
      return function SettingsPage() {
        var settings = useStore(deps.settingsSource)
        useStore(deps.tickStore)
        var flash = React.useState('')

        function update(patch) {
          deps.settingsSource.update(patch)
        }

        function showFlash(text) {
          flash[1](text)
          window.setTimeout(function () {
            flash[1](function (current) {
              return current === text ? '' : current
            })
          }, 1800)
        }

        function testNotification() {
          deps.bus.emit({ title: t('testTitle'), summary: t('testSummary') })
          playChime('ok')
        }

        return h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', maxWidth: '640px', padding: '4px 4px 32px' } },
          h('h2', { style: { fontSize: '16px', fontWeight: 600, margin: '0 0 4px' } }, t('title')),
          h(
            'p',
            {
              style: {
                fontSize: '13px',
                color: 'var(--dsw-alias-label-secondary)',
                lineHeight: 1.6,
                margin: '0 0 12px',
              },
            },
            t('subtitle'),
          ),
          settingRow(
            t('enable'),
            t('enableHint'),
            h(Switch, {
              checked: settings.enabled,
              label: t('enable'),
              onChange: function (next) {
                update({ enabled: next })
              },
            }),
          ),
          settingRow(
            t('sound'),
            t('soundHint'),
            h(Switch, {
              checked: settings.sound,
              label: t('sound'),
              onChange: function (next) {
                update({ sound: next })
                if (next) playChime('ok')
              },
            }),
          ),
          settingRow(
            t('width'),
            t('widthHint'),
            sizeControl(t('width'), settings.width, MIN_WIDTH, MAX_WIDTH, 10, function (next) {
              update({ width: next })
            }),
          ),
          settingRow(
            t('height'),
            t('heightHint'),
            sizeControl(t('height'), settings.height, MIN_HEIGHT, MAX_HEIGHT, 4, function (next) {
              update({ height: next })
            }),
          ),
          settingRow(
            t('radius'),
            t('radiusHint'),
            sizeControl(t('radius'), settings.radius, MIN_RADIUS, MAX_RADIUS, 2, function (next) {
              update({ radius: next })
            }),
          ),
          settingRow(
            t('shadow'),
            t('shadowHint'),
            sizeControl(t('shadow'), settings.shadow, MIN_SHADOW, MAX_SHADOW, 2, function (next) {
              update({ shadow: next })
            }),
          ),
          settingRow(
            t('offsetBottom'),
            t('offsetBottomHint'),
            sizeControl(t('offsetBottom'), settings.offsetBottom, MIN_OFFSET, MAX_OFFSET, 4, function (next) {
              update({ offsetBottom: next })
            }),
          ),
          settingRow(
            t('offsetRight'),
            t('offsetRightHint'),
            sizeControl(t('offsetRight'), settings.offsetRight, MIN_OFFSET, MAX_OFFSET, 4, function (next) {
              update({ offsetRight: next })
            }),
          ),
          settingRow(
            t('dnd'),
            t('dndHint'),
            h(Switch, {
              checked: settings.dnd.enabled,
              label: t('dnd'),
              onChange: function (next) {
                update({ dnd: { enabled: next } })
              },
            }),
          ),
          settings.dnd.enabled
            ? h(
                'div',
                {
                  style: {
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '0 0 14px',
                    borderTop: '1px solid var(--dsw-alias-border-l1)',
                    paddingTop: '13px',
                  },
                },
                timeField(t('dndFrom'), settings.dnd.start, function (next) {
                  update({ dnd: { start: next } })
                }),
                timeField(t('dndTo'), settings.dnd.end, function (next) {
                  update({ dnd: { end: next } })
                }),
              )
            : null,
          settingRow(
            t('defaults'),
            flash[0] || t('defaultsHint'),
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' } },
              actionButton(t('saveDefault'), function () {
                saveUserDefaults(settings)
                showFlash(t('saveDefaultDone'))
              }),
              actionButton(t('resetDefault'), function () {
                update(defaultSettings())
                showFlash(t('resetDefaultDone'))
              }),
            ),
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '13px 0',
                borderTop: '1px solid var(--dsw-alias-border-l1)',
              },
            },
            h(
              'div',
              { style: { flex: '1 1 auto', minWidth: 0 } },
              h('div', { style: { fontSize: '13px', fontWeight: 500 } }, t('test')),
              h(
                'div',
                {
                  style: {
                    fontSize: '12px',
                    color: 'var(--dsw-alias-label-secondary)',
                    lineHeight: 1.5,
                    marginTop: '2px',
                  },
                },
                t('testHint'),
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                onClick: testNotification,
                style: {
                  appearance: 'none',
                  flex: '0 0 auto',
                  border: 0,
                  cursor: 'pointer',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  background: 'var(--dsw-alias-brand-primary)',
                  color: '#ffffff',
                  font: 'inherit',
                  fontSize: '13px',
                  fontWeight: 500,
                },
              },
              t('test'),
            ),
          ),
        )
      }
    }

    function timeField(label, value, onChange) {
      return h(
        'label',
        { style: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } },
        label,
        h('input', {
          type: 'time',
          value: value,
          onChange: function (event) {
            onChange(event.target.value)
          },
          style: {
            appearance: 'none',
            border: '1px solid var(--dsw-alias-border-l1)',
            borderRadius: '8px',
            background: 'var(--dsw-alias-bg-layer-2)',
            color: 'var(--dsw-alias-label-primary)',
            font: 'inherit',
            fontSize: '12px',
            padding: '5px 8px',
            width: '112px',
          },
        }),
      )
    }

    var settingsSource = createSettingsSource()
    var tickStore = createTickStore()
    var bus = createBus()
    var openSessionRef = { current: null }
    var deps = {
      tickStore: tickStore,
      settingsSource: settingsSource,
      bus: bus,
      openSession: function (sessionId) {
        var open = openSessionRef.current
        if (typeof open === 'function') open(sessionId)
      },
    }
    var NotifierOverlay = createNotifier(deps)
    var SettingsPage = createSettingsPage(deps)

    function openSession(ctx, sessionId) {
      if (typeof sessionId !== 'string' || sessionId === '') return
      try {
        var workspace = typeof ctx.get === 'function' ? ctx.get('uiWorkspace') : undefined
        if (workspace && typeof workspace.openSession === 'function') {
          workspace.openSession(sessionId)
          return
        }
      } catch (error) {

      }
      try {
        var layout = typeof ctx.get === 'function' ? ctx.get('layout') : undefined
        if (layout && typeof layout.selectPanel === 'function') layout.selectPanel('conversation')
      } catch (error) {

      }
    }

    function apply(ctx) {
      langRef.read = function () {
        try {
          var locale = typeof ctx.get === 'function' ? ctx.get('locale') : undefined
          if (locale && typeof locale.getSnapshot === 'function') {
            var snapshot = locale.getSnapshot()
            var active = snapshot && (snapshot.active || snapshot.locale || snapshot.id || snapshot.language)
            if (typeof active === 'string' && active !== '') return active
          }
        } catch (error) {

        }
        return documentLang()
      }

      openSessionRef.current = function (sessionId) {
        openSession(ctx, sessionId)
      }

      function onGesture() {
        primeAudio()
      }
      document.addEventListener('pointerdown', onGesture, true)
      document.addEventListener('keydown', onGesture, true)
      if (typeof ctx.effect === 'function') {
        ctx.effect(function () {
          return function () {
            document.removeEventListener('pointerdown', onGesture, true)
            document.removeEventListener('keydown', onGesture, true)
          }
        }, 'dsh-session-toast: audio priming listeners')
      }

      if (typeof ctx.on === 'function') {
        try {
          ctx.on('locale/change', function () {
            tickStore.bump()
          })
        } catch (error) {

        }
      }

      if (ctx.slots && typeof ctx.slots.inject === 'function' && typeof ctx.slots.register === 'function') {
        ctx.slots.inject('shell.overlay', function () {
          var off = ctx.slots.register({ name: 'shell.overlay', id: TOAST_ID, order: 50 }, NotifierOverlay)
          return typeof off === 'function' ? off : function () {}
        })
        ctx.slots.inject('settings.section', function () {
          var off = ctx.slots.register(
            {
              name: 'settings.section',
              id: SETTINGS_SECTION_ID,
              order: 25,
              label: function () {
                return t('nav')
              },
            },
            SettingsPage,
          )
          return typeof off === 'function' ? off : function () {}
        })
      }
    }

    return {
      inject: ['slots'],
      apply: apply,
    }
  },
})
