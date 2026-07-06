import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SharePanel } from '../sections/SharePanel'
import { buildCurvePoints, calculateGott, defaultParams } from '../lib/gott'
import type { GottParams } from '../lib/gott'
import { paramsFromSearch, searchFromParams } from '../lib/query'

function toNumberInput(value: string): number {
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : 0
}

export function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [params, setParams] = useState<GottParams>(() => {
        if ([...searchParams.entries()].length === 0) {
            return defaultParams
        }

        return paramsFromSearch(searchParams)
    })

    const result = useMemo(() => calculateGott(params), [params])
    const curve = useMemo(() => buildCurvePoints(params.elapsed, params.unit), [params.elapsed, params.unit])

    const updateParams = (patch: Partial<GottParams>) => {
        const next = { ...params, ...patch }
        setParams(next)
        setSearchParams(searchFromParams(next), { replace: true })
    }

    const onInput =
        (field: keyof GottParams) =>
            (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                const value = event.target.value
                if (field === 'event') {
                    updateParams({ event: value })
                    return
                }

                if (field === 'unit') {
                    updateParams({ unit: value as GottParams['unit'] })
                    return
                }

                updateParams({ [field]: toNumberInput(value) } as Partial<GottParams>)
            }

    return (
        <main>
            <section className="hero-panel">
                <h1>Gott theory playground</h1>
                <p>
                    Enter how long a process has existed and simulate how the probability of ending changes while you move the assumptions.
                </p>
            </section>

            <section className="grid">
                <article className="panel input-panel">
                    <h2>Inputs</h2>

                    <div className="field">
                        <label htmlFor="event">Event name</label>
                        <input id="event" value={params.event} onChange={onInput('event')} maxLength={80} />
                    </div>

                    <div className="field">
                        <label htmlFor="elapsed">Elapsed time</label>
                        <input id="elapsed" type="number" min="0.0001" step="0.1" value={params.elapsed} onChange={onInput('elapsed')} />
                    </div>

                    <div className="field">
                        <label htmlFor="unit">Time unit</label>
                        <select id="unit" value={params.unit} onChange={onInput('unit')}>
                            <option value="days">Days</option>
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="horizon">Prediction horizon ({params.unit})</label>
                        <input id="horizon" type="number" min="0.0001" step="0.1" value={params.horizon} onChange={onInput('horizon')} />
                    </div>

                    <div className="field">
                        <label htmlFor="confidence">Confidence for the Gott interval</label>
                        <div className="range-row">
                            <input
                                id="confidence"
                                type="range"
                                min="0.05"
                                max="0.99"
                                step="0.01"
                                value={params.confidence}
                                onChange={onInput('confidence')}
                            />
                            <span className="range-value">{Math.round(result.boundedConfidence * 100)}%</span>
                        </div>
                    </div>

                    <p className="note">
                        Default is 50% confidence. At 50%, the remaining time interval becomes approximately one-third to three times the observed age.
                    </p>
                </article>

                <article className="panel output-panel">
                    <h2>Results</h2>
                    <div className="metric-grid">
                        <div className="metric">
                            <p>Probability event ends before horizon</p>
                            <h3>{(result.probabilityEndsBeforeHorizon * 100).toFixed(2)}%</h3>
                        </div>

                        <div className="metric">
                            <p>Median remaining time</p>
                            <h3>
                                {result.medianRemaining.toLocaleString('en-US')} {params.unit}
                            </h3>
                        </div>

                        <div className="metric">
                            <p>Confidence window</p>
                            <h3>{result.formattedWindow}</h3>
                        </div>
                    </div>

                    <div className="curve">
                        <h3>How probability evolves with horizon</h3>
                        {curve.map((point) => (
                            <div className="curve-row" key={point.label}>
                                <span>{point.label}</span>
                                <div className="bar" style={{ width: `${Math.max(3, point.probability * 100)}%` }} />
                                <strong>{(point.probability * 100).toFixed(1)}%</strong>
                            </div>
                        ))}
                    </div>

                    <p className="note" style={{ marginTop: '0.8rem' }}>
                        Practical interpretation: assuming your position in the lifespan is random, the chance to end before horizon H is H / (elapsed + H).
                    </p>
                </article>
            </section>

            <SharePanel params={params} result={result} />
        </main>
    )
}
