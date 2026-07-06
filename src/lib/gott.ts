export type TimeUnit = 'days' | 'months' | 'years'

export type GottParams = {
    event: string
    elapsed: number
    horizon: number
    confidence: number
    unit: TimeUnit
}

export type GottResult = {
    boundedConfidence: number
    lowerRemaining: number
    upperRemaining: number
    medianRemaining: number
    probabilityEndsBeforeHorizon: number
    formattedWindow: string
}

const unitToYears: Record<TimeUnit, number> = {
    days: 1 / 365,
    months: 1 / 12,
    years: 1,
}

const labelMap: Record<TimeUnit, string> = {
    days: 'days',
    months: 'months',
    years: 'years',
}

export const defaultParams: GottParams = {
    event: 'Human civilization',
    elapsed: 200000,
    horizon: 500,
    confidence: 0.5,
    unit: 'years',
}

export function clampConfidence(value: number): number {
    return Math.min(0.99, Math.max(0.05, value))
}

function round(value: number): number {
    return Number(value.toFixed(4))
}

function roundLabel(value: number): string {
    if (value >= 1000) {
        return Math.round(value).toLocaleString('en-US')
    }

    return value.toFixed(1)
}

function getProbabilityEndsBeforeHorizon(elapsed: number, horizon: number): number {
    return horizon / (elapsed + horizon)
}

export function calculateGott(params: GottParams): GottResult {
    const elapsed = Math.max(0.0001, params.elapsed)
    const horizon = Math.max(0.0001, params.horizon)
    const boundedConfidence = clampConfidence(params.confidence)
    const alpha = (1 - boundedConfidence) / 2

    const lowerRemaining = elapsed * (alpha / (1 - alpha))
    const upperRemaining = elapsed * ((1 - alpha) / alpha)
    const medianRemaining = elapsed
    const probabilityEndsBeforeHorizon = getProbabilityEndsBeforeHorizon(elapsed, horizon)
    const unitLabel = labelMap[params.unit]
    const currentYear = new Date().getFullYear()
    const lowerInYears = lowerRemaining * unitToYears[params.unit]
    const upperInYears = upperRemaining * unitToYears[params.unit]
    const lowerEnd = Math.round(currentYear + lowerInYears)
    const upperEnd = Math.round(currentYear + upperInYears)

    return {
        boundedConfidence: round(boundedConfidence),
        lowerRemaining: round(lowerRemaining),
        upperRemaining: round(upperRemaining),
        medianRemaining: round(medianRemaining),
        probabilityEndsBeforeHorizon: round(probabilityEndsBeforeHorizon),
        formattedWindow: `${roundLabel(lowerRemaining)} to ${roundLabel(upperRemaining)} ${unitLabel} (roughly ${lowerEnd}-${upperEnd})`,
    }
}

export function buildCurvePoints(elapsed: number, unit: TimeUnit) {
    const points = [0.25, 0.5, 1, 2, 4].map((factor) => {
        const horizon = Number((elapsed * factor).toFixed(2))
        const probability = horizon / (elapsed + horizon)

        return {
            label: `${horizon.toLocaleString('en-US')} ${labelMap[unit]}`,
            probability,
        }
    })

    return points
}
