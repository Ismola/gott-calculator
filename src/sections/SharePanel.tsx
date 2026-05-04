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

    return (
        <section className="panel share-panel">
            <div className="share-card" ref={cardRef}>
                <div className="share-grid">
                    <div>
                        <h2>Shareable prediction card</h2>
                        <p>
                            Event: <strong>{params.event}</strong>
                        </p>
                        <p>
                            P(end before horizon): <strong>{(result.probabilityEndsBeforeHorizon * 100).toFixed(2)}%</strong>
                        </p>
                        <p>
                            Confidence window: <strong>{result.formattedWindow}</strong>
                        </p>
                        <p className="note">QR target: gott-calculator.ismola.dev with your current parameters.</p>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '0.8rem', padding: '0.5rem' }}>
                        <QRCodeSVG value={publicShareUrl} size={128} includeMargin />
                    </div>
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
