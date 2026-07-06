import { useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import type { GottParams, GottResult } from '../lib/gott'
import { buildPublicShareUrl } from '../lib/query'

type SharePanelProps = {
    params: GottParams
    result: GottResult
}

const publicDomain = 'https://gott-calculator.ismola.dev'

export function SharePanel({ params, result }: SharePanelProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState('Ready to share')

    const localShareUrl = useMemo(() => {
        return buildPublicShareUrl(window.location.origin, params)
    }, [params])

    const publicShareUrl = useMemo(() => {
        return buildPublicShareUrl(publicDomain, params)
    }, [params])

    const downloadImage = async () => {
        if (!cardRef.current) {
            return
        }

        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
            })
            const anchor = document.createElement('a')
            anchor.download = 'gott-result.png'
            anchor.href = dataUrl
            anchor.click()
            setStatus('PNG generated')
        } catch {
            setStatus('Could not generate PNG')
        }
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(localShareUrl)
            setStatus('Link copied to clipboard')
        } catch {
            setStatus('Clipboard not available in this browser')
        }
    }

    const nativeShare = async () => {
        if (!navigator.share) {
            setStatus('Web Share API not supported')
            return
        }

        try {
            await navigator.share({
                title: 'Gott prediction',
                text: `Prediction for ${params.event}: ${(result.probabilityEndsBeforeHorizon * 100).toFixed(2)}% chance to end before horizon.`,
                url: localShareUrl,
            })
            setStatus('Shared successfully')
        } catch {
            setStatus('Share cancelled or failed')
        }
    }

    const pct = (result.probabilityEndsBeforeHorizon * 100).toFixed(1)
    const singular = (unit: string) => unit.replace(/s$/, '')
    const pluralise = (n: number, unit: string) => `${n.toLocaleString()} ${n === 1 ? singular(unit) : unit}`
    const horizonLabel = pluralise(params.horizon, params.unit)
    const elapsedLabel = pluralise(params.elapsed, params.unit)

    return (
        <section className="panel share-panel">
            <div className="share-card" ref={cardRef}>
                <div className="share-card-top">
                    <div className="share-card-meta">
                        <span className="share-brand-dot" />
                        <span className="share-brand-label">Gott Calculator</span>
                    </div>
                    <p className="share-event-name">{params.event}</p>
                    <p className="share-elapsed-note">observed for {elapsedLabel}</p>
                </div>

                <div className="share-card-body">
                    <div className="share-big-stat">
                        <span className="share-big-pct">{pct}%</span>
                        <span className="share-big-label">
                            chance it ends in<br />the next {horizonLabel}
                        </span>
                    </div>

                    <div className="share-card-bottom">
                        <div className="share-window">
                            <p className="share-window-hint">May still last</p>
                            <p className="share-window-value">{result.formattedWindow}</p>
                        </div>
                        <div className="share-qr-wrap">
                            <QRCodeSVG value={publicShareUrl} size={88} />
                        </div>
                    </div>

                    <p className="share-confidence-note">{Math.round(params.confidence * 100)}% confidence · gott-calculator.ismola.dev</p>
                </div>
            </div>

            <div className="actions">
                <button type="button" onClick={downloadImage}>
                    Download PNG
                </button>
                <button type="button" className="secondary" onClick={copyLink}>
                    Copy link
                </button>
                <button type="button" className="ghost" onClick={nativeShare}>
                    Web share
                </button>
            </div>

            <p className="note">{status}</p>
            <p className="note">Share URL: {localShareUrl}</p>
        </section>
    )
}
