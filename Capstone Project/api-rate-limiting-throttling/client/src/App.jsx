import React, { useEffect, useMemo, useRef, useState } from 'react'

function HeaderRow({ headers }) {
  const items = [
    ['X-RateLimit-Limit', headers['x-ratelimit-limit']],
    ['X-RateLimit-Remaining', headers['x-ratelimit-remaining']],
    ['X-RateLimit-Reset', headers['x-ratelimit-reset']],
    ['Retry-After', headers['retry-after']]
  ]
  return (
    <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
      <tbody>
        {items.map(([k, v]) => (
          <tr key={k}>
            <td style={{ fontWeight: 'bold', padding: 4, borderBottom: '1px solid #eee' }}>{k}</td>
            <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{v ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function App() {
  const [route, setRoute] = useState('/api/resource')
  const [apiKey, setApiKey] = useState('')
  const [jwt, setJwt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const lastResetRef = useRef(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  async function callApi() {
    setLoading(true)
    try {
      const res = await fetch(route, {
        headers: {
          'x-api-key': apiKey || undefined,
          'authorization': jwt ? `Bearer ${jwt}` : undefined
        }
      })
      const data = await res.json().catch(() => ({}))
      const headers = Object.fromEntries([...res.headers.entries()])
      setResult({ status: res.status, data, headers })
      const reset = Number(headers['x-ratelimit-reset'] || '0')
      setCountdown(reset)
      lastResetRef.current = reset
    } catch (e) {
      setResult({ status: 0, error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
      <h2>Rate Limit Tester</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          Route:
          <select value={route} onChange={(e) => setRoute(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="/api/resource">/api/resource</option>
            <option value="/api/heavy">/api/heavy</option>
          </select>
        </label>
        <label>
          API Key:
          <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="optional" style={{ marginLeft: 8 }} />
        </label>
        <label style={{ flex: 1 }}>
          JWT:
          <input value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder="optional" style={{ marginLeft: 8, width: '100%' }} />
        </label>
        <button onClick={callApi} disabled={loading}>
          {loading ? 'Calling…' : 'Call API'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <div><b>Status</b>: {result.status}</div>
          {'headers' in result && result.headers && <HeaderRow headers={result.headers} />}
          {'data' in result && result.data && (
            <pre style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginTop: 8 }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <b>Reset Countdown</b>: {countdown}s
        <div style={{ height: 10, background: '#eee', borderRadius: 4, marginTop: 6 }}>
          <div style={{ height: '100%', width: `${(1 - (countdown / Math.max(1, lastResetRef.current))) * 100}%`, background: '#4caf50', transition: 'width 1s linear', borderRadius: 4 }}/>
        </div>
      </div>
    </div>
  )
}


