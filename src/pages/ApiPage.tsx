import { Link, useLocation } from 'react-router-dom'
import { calculateGott } from '../lib/gott'
import { paramsFromSearch } from '../lib/query'

export function ApiPage() {
    const location = useLocation()
    const search = new URLSearchParams(location.search)
    const params = paramsFromSearch(search)
    const result = calculateGott(params)

    const endpointUrl = `${location.pathname}?${search.toString() || 'event=Human+civilization&elapsed=200000&horizon=500&confidence=0.5&unit=years'}`

    const payload = {
        endpoint: '/api/gott',
        query: params,
        result,
        generatedAt: new Date().toISOString(),
        note: 'Frontend endpoint: computed in browser, no backend server.',
    }

    return (
        <main className="endpoint-layout panel">
            <h1>Frontend endpoint view</h1>
            <p>
                This route simulates an endpoint and reads query parameters. Use it as:
            </p>
            <p className="endpoint-url">{endpointUrl}</p>
            <p className="note">
                Example: /api/gott?event=Startup&elapsed=4&horizon=3&confidence=0.5&unit=years
            </p>

            <div className="json-box">
                <pre>{JSON.stringify(payload, null, 2)}</pre>
            </div>

            <div className="actions">
                <Link to="/">
                    <button type="button" className="secondary">
                        Back to calculator
                    </button>
                </Link>
            </div>
        </main>
    )
}
