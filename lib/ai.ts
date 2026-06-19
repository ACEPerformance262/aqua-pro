import Anthropic from '@anthropic-ai/sdk'
import type { WaterTestValues, PoolType, SanitiserType } from './water-chemistry'
import { calculateDoses, classifyRisk, getRanges } from './water-chemistry'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface WaterAdviceInput {
  poolName: string
  poolType: PoolType
  sanitiserType: SanitiserType
  volumeLitres: number
  values: WaterTestValues
}

export async function getWaterAdvice(input: WaterAdviceInput): Promise<string> {
  const { poolName, poolType, sanitiserType, volumeLitres, values } = input
  const risk = classifyRisk(values, poolType, sanitiserType)
  const doses = calculateDoses(values, poolType, sanitiserType, volumeLitres)
  const ranges = getRanges(poolType, sanitiserType)

  // Build a concise summary of what's out of range
  const outOfRange = Object.entries(values)
    .filter(([key, val]) => {
      if (val === undefined || val === null) return false
      const r = ranges[key]
      if (!r) return false
      return (val as number) < r.min || (val as number) > r.max
    })
    .map(([key, val]) => {
      const r = ranges[key]
      return `${r.label}: ${val}${r.unit} (target: ${r.min}–${r.max}${r.unit})`
    })

  const systemPrompt = `You are an expert pool water chemist and aquatic facility compliance officer.
You explain water chemistry problems and remediation steps clearly to pool technicians,
some of whom may not have deep chemistry backgrounds.
Be practical, safe, and specific. Format your response clearly with sections.
Always mention safety precautions for chemical handling.
Refer to Australian standards (AS/NZS 1838, health department requirements) where relevant.`

  const userPrompt = `
Pool: ${poolName} (${poolType}, ${sanitiserType}, ${volumeLitres.toLocaleString()}L)
Risk Level: ${risk.riskLevel.toUpperCase()}

Current Water Readings:
${Object.entries(values)
  .filter(([, v]) => v !== undefined && v !== null)
  .map(([k, v]) => {
    const r = ranges[k]
    return r ? `  • ${r.label}: ${v} ${r.unit}` : `  • ${k}: ${v}`
  })
  .join('\n')}

Parameters Out of Range:
${outOfRange.length ? outOfRange.map(o => `  ⚠ ${o}`).join('\n') : '  ✓ All in range'}

Calculated Chemical Doses:
${doses.length ? doses.map(d => `  • ${d.parameter}: Add ${d.dose} of ${d.chemical}. ${d.notes ?? ''}`).join('\n') : '  None required'}

Please provide:
1. A plain-English explanation of what is wrong (if anything) and why it matters for swimmer safety
2. Step-by-step corrective actions in the right order (chemistry sequence matters)
3. Safety warnings for chemical handling
4. When to re-test and what to expect
5. Whether the pool should remain open or be closed during treatment
${risk.riskLevel === 'red' ? '\n⚠ CRITICAL: This pool may need immediate closure. Address this urgently.' : ''}
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
