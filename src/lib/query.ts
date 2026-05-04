import { defaultParams } from './gott'
import type { GottParams, TimeUnit } from './gott'

const allowedUnits: TimeUnit[] = ['days', 'months', 'years']

function parseNumber(input: string | null, fallback: number): number {
    if (!input) {
        return fallback
    }

    const value = Number(input)
    return Number.isFinite(value) ? value : fallback
}

export function paramsFromSearch(search: URLSearchParams): GottParams {
    const unitCandidate = search.get('unit')
    const unit = allowedUnits.includes(unitCandidate as TimeUnit)
        ? (unitCandidate as TimeUnit)
        : defaultParams.unit

    return {
        event: search.get('event')?.slice(0, 80) || defaultParams.event,
        elapsed: Math.max(0.0001, parseNumber(search.get('elapsed'), defaultParams.elapsed)),
        horizon: Math.max(0.0001, parseNumber(search.get('horizon'), defaultParams.horizon)),
        confidence: parseNumber(search.get('confidence'), defaultParams.confidence),
        unit,
    }
}

export function searchFromParams(params: GottParams): URLSearchParams {
    const search = new URLSearchParams()
    search.set('event', params.event)
    search.set('elapsed', String(params.elapsed))
    search.set('horizon', String(params.horizon))
    search.set('confidence', String(params.confidence))
    search.set('unit', params.unit)
    return search
}

export function buildPublicShareUrl(base: string, params: GottParams): string {
    const query = searchFromParams(params).toString()
    const safeBase = base.endsWith('/') ? base.slice(0, -1) : base
    return `${safeBase}/?${query}`
}
