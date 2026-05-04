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
    const horizonLabel = `${params.horizon.toLocaleString()} ${params.unit}${params.horizon !== 1 ? 's' : ''}`
    const elapsedLabel = `${params.elapsed.toLocaleString()} ${params.unit}${params.elapsed !== 1 ? 's' : ''}`

    return (
        <section className="panel share-panel">
            <div className="share-card" ref={cardRef}>
                <div className="share-card-header">
                    <span className="share-brand-label">Gott Calculator</span>
                    <div className="share-qr-wrap">
                        <QRCodeSVG value={publicShareUrl} size={80} />
                    </div>
                </div>

                <p className="share-event-name">{params.event}</p>

                <div className="share-big-stat">
                    <span className="share-big-pct">{pct}%</span>
                    <span className="share-big-label">
                        chance it ends in<br />the next {horizonLabel}
                    </span>
                </div>

                <div className="share-divider" />

                <p className="share-duration-hint">How long it might still last</p>
                <p className="share-duration-value">{result.formattedWindow}</p>
                <p className="share-meta-note">
                    Observed: {elapsedLabel} · {Math.round(params.confidence * 100)}% confidence
                </p>
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
