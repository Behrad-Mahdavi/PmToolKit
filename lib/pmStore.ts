import { supabase } from './supabase'
import { calculateRICE, calculateICE, calculateUnitEconomics } from './formulas'

export interface Project {
  id: string; ownerId: string; name: string; createdAt: string
}

export interface BacklogItem {
  id: string; projectId: string; title: string; description?: string
  reach?: number; impact?: number; confidence?: number; effort?: number
  riceScore?: number; iceImpact?: number; iceConfidence?: number; iceEase?: number; iceScore?: number
  kanoCategory?: string; status: string; createdAt: string; ownerId?: string
}

export interface MetricSnapshot {
  id: string; projectId: string; date: string; metricName: string; metricType: string
  value: number; unit: string; normalMin?: number; normalMax?: number
}

export interface Experiment {
  id: string; projectId: string; name: string; baselineRate: number; mde: number
  alpha: number; power: number; n1: number; x1: number; n2: number; x2: number
  status: string; createdAt: string
}

export interface FunnelStep { name: string; users: number }

export interface Funnel {
  id: string; projectId: string; name: string; steps: FunnelStep[]; createdAt: string
}

export interface CohortEntry {
  id: string; projectId: string; cohortName: string; size: number; periods: number[]
}

export interface PricingSettings {
  projectId: string; tooCheap: number; cheap: number; expensive: number; tooExpensive: number
  attractive: number; performance: number; mustBe: number; indifferent: number
}

export interface KeyResult { id: string; description: string; startValue: number; targetValue: number; currentValue: number }

export interface OKR {
  id: string; projectId: string; objective: string; quarter: string; keyResults: KeyResult[]
}

const DEFAULT_PRICING = {
  tooCheap: 10000, cheap: 20000, expensive: 45000, tooExpensive: 70000,
  attractive: 15, performance: 25, mustBe: 10, indifferent: 8
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch { return null }
}

function lsKey(key: string, uid?: string | null) {
  return uid ? `pmtool_${uid}_${key}` : `pmtool_${key}`
}

function getLocal<T>(key: string, fallback: T[], uid?: string | null): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(lsKey(key, uid))
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch { return fallback }
}

function setLocal(key: string, data: any, uid?: string | null) {
  if (typeof window === 'undefined') return
  localStorage.setItem(lsKey(key, uid), JSON.stringify(data))
}

// ─── Project ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('Project').select('*').eq('ownerId', session.user.id)
      if (!error && data && data.length > 0) return data as Project[]
    }
  } catch {}
  return getLocal<Project>('projects', [
    { id: 'proj-1', ownerId: uid || '', name: 'محصول اصلی SaaS', createdAt: new Date().toISOString() }
  ], uid)
}

export async function getCurrentProjectId(): Promise<string> {
  if (typeof window === 'undefined') return 'proj-1'
  const uid = await getUserId()
  const key = lsKey('current_project', uid)
  const stored = localStorage.getItem(key)
  if (stored) return stored
  localStorage.setItem(key, 'proj-1')
  return 'proj-1'
}

export async function setCurrentProjectId(id: string) {
  if (typeof window === 'undefined') return
  const uid = await getUserId()
  localStorage.setItem(lsKey('current_project', uid), id)
}

export async function createProject(name: string): Promise<Project | null> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('Project').insert([
        { ownerId: session.user.id, name }
      ]).select().single()
      if (!error && data) return data as Project
    }
  } catch {}
  const proj: Project = { id: 'proj-' + Date.now(), ownerId: uid || '', name, createdAt: new Date().toISOString() }
  const projects = getLocal<Project>('projects', [], uid)
  projects.push(proj)
  setLocal('projects', projects, uid)
  return proj
}

// ─── Backlog Item ────────────────────────────────────────────────────────────

export async function getBacklogItems(projectId: string): Promise<BacklogItem[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('BacklogItem').select('*')
        .eq('projectId', projectId).eq('ownerId', session.user.id)
      if (!error && data) return data as BacklogItem[]
    }
  } catch {}
  return getLocal<BacklogItem>('backlog', [], uid).filter(b => b.projectId === projectId)
}

export async function saveBacklogItem(item: any) {
  const riceScore = calculateRICE(item.reach, item.impact, item.confidence, item.effort) || undefined
  const iceScore = calculateICE(item.iceImpact, item.iceConfidence, item.iceEase) || undefined
  const payload = { ...item, riceScore, iceScore }

  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      let result
      if (payload.id && !payload.id.startsWith('b-')) {
        result = await supabase.from('BacklogItem').update(payload).eq('id', payload.id).eq('ownerId', session.user.id)
      } else {
        result = await supabase.from('BacklogItem').insert({ ...payload, ownerId: session.user.id, id: undefined }).select()
      }
      if (!result.error) return
    }
  } catch {}

  const all = getLocal<BacklogItem>('backlog', [], uid)
  if (payload.id && all.find(b => b.id === payload.id)) {
    const idx = all.findIndex(b => b.id === payload.id)
    if (idx >= 0) all[idx] = { ...all[idx], ...payload }
  } else {
    all.push({ ...payload, ownerId: uid || undefined, id: 'b-' + Date.now(), createdAt: new Date().toISOString() })
  }
  setLocal('backlog', all, uid)
}

export async function deleteBacklogItem(id: string) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { error } = await supabase.from('BacklogItem').delete().eq('id', id).eq('ownerId', session.user.id)
      if (!error) return
    }
  } catch {}
  const all = getLocal<BacklogItem>('backlog', [], uid).filter(b => b.id !== id)
  setLocal('backlog', all, uid)
}

// ─── Metric Snapshot ─────────────────────────────────────────────────────────

export async function getMetricSnapshots(projectId: string): Promise<MetricSnapshot[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('MetricSnapshot').select('*')
        .eq('projectId', projectId).eq('ownerId', session.user.id)
      if (!error && data) return data as MetricSnapshot[]
    }
  } catch {}
  return getLocal<MetricSnapshot>('metrics', [], uid).filter(m => m.projectId === projectId)
}

export async function saveMetricSnapshot(snapshot: any) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const result = await supabase.from('MetricSnapshot').insert({ ...snapshot, ownerId: session.user.id }).select()
      if (!result.error) return
    }
  } catch {}
  const all = getLocal<MetricSnapshot>('metrics', [], uid)
  all.push({ ...snapshot, id: 'm-' + Date.now(), date: new Date().toISOString() })
  setLocal('metrics', all, uid)
}

// ─── Experiment ──────────────────────────────────────────────────────────────

export async function getExperiments(projectId: string): Promise<Experiment[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('Experiment').select('*')
        .eq('projectId', projectId).eq('ownerId', session.user.id)
      if (!error && data) return data as Experiment[]
    }
  } catch {}
  return getLocal<Experiment>('experiments', [], uid).filter(e => e.projectId === projectId)
}

export async function saveExperiment(exp: any) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      let result
      if (exp.id && !exp.id.startsWith('exp-')) {
        result = await supabase.from('Experiment').update(exp).eq('id', exp.id).eq('ownerId', session.user.id)
      } else {
        result = await supabase.from('Experiment').insert({ ...exp, ownerId: session.user.id, id: undefined }).select()
      }
      if (!result.error) return
    }
  } catch {}
  const all = getLocal<Experiment>('experiments', [], uid)
  if (exp.id && all.find(e => e.id === exp.id)) {
    const idx = all.findIndex(e => e.id === exp.id)
    if (idx >= 0) all[idx] = { ...all[idx], ...exp }
  } else {
    all.push({ ...exp, id: 'exp-' + Date.now(), createdAt: new Date().toISOString() })
  }
  setLocal('experiments', all, uid)
}

// ─── Funnel ──────────────────────────────────────────────────────────────────

export async function getFunnels(projectId: string): Promise<Funnel[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('Funnel').select('*').eq('projectId', projectId).eq('ownerId', session.user.id)
      if (!error && data) return data as Funnel[]
    }
  } catch {}
  return getLocal<Funnel>('funnels', [], uid).filter(f => f.projectId === projectId)
}

export async function saveFunnel(funnel: any) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      let result
      if (funnel.id && !funnel.id.startsWith('fun-')) {
        result = await supabase.from('Funnel').update(funnel).eq('id', funnel.id).eq('ownerId', session.user.id)
      } else {
        result = await supabase.from('Funnel').insert({ ...funnel, ownerId: session.user.id, id: undefined }).select()
      }
      if (!result.error) return
    }
  } catch {}
  const all = getLocal<Funnel>('funnels', [], uid)
  if (funnel.id && all.find(f => f.id === funnel.id)) {
    const idx = all.findIndex(f => f.id === funnel.id)
    if (idx >= 0) all[idx] = { ...all[idx], ...funnel }
  } else {
    all.push({ ...funnel, id: 'fun-' + Date.now(), createdAt: new Date().toISOString() })
  }
  setLocal('funnels', all, uid)
}

// ─── Cohort Entry ────────────────────────────────────────────────────────────

export async function getCohortEntries(projectId: string): Promise<CohortEntry[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('CohortEntry').select('*').eq('projectId', projectId).eq('ownerId', session.user.id)
      if (!error && data) return data as CohortEntry[]
    }
  } catch {}
  return getLocal<CohortEntry>('cohorts', [], uid).filter(c => c.projectId === projectId)
}

export async function saveCohortEntry(entry: any) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      let result
      if (entry.id && !entry.id.startsWith('coh-')) {
        result = await supabase.from('CohortEntry').update(entry).eq('id', entry.id).eq('ownerId', session.user.id)
      } else {
        result = await supabase.from('CohortEntry').insert({ ...entry, ownerId: session.user.id, id: undefined }).select()
      }
      if (!result.error) return
    }
  } catch {}
  const all = getLocal<CohortEntry>('cohorts', [], uid)
  if (entry.id && all.find(c => c.id === entry.id)) {
    const idx = all.findIndex(c => c.id === entry.id)
    if (idx >= 0) all[idx] = { ...all[idx], ...entry }
  } else {
    all.push({ ...entry, id: 'coh-' + Date.now() })
  }
  setLocal('cohorts', all, uid)
}

// ─── Pricing Settings ────────────────────────────────────────────────────────

export async function getPricingSettings(projectId: string): Promise<PricingSettings> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('PricingSettings').select('*').eq('projectId', projectId).single()
      if (!error && data) return data as PricingSettings
    }
  } catch {}
  if (typeof window === 'undefined') return { projectId, ...DEFAULT_PRICING }
  try {
    const raw = localStorage.getItem(lsKey('pricing', uid))
    if (raw) {
      const all: PricingSettings[] = JSON.parse(raw)
      const found = all.find(p => p.projectId === projectId)
      if (found) return found
    }
  } catch {}
  return { projectId, ...DEFAULT_PRICING }
}

export async function savePricingSettings(settings: PricingSettings) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error: fetchErr } = await supabase.from('PricingSettings').select('id').eq('projectId', settings.projectId).single()
      if (!fetchErr && data) {
        const { error: updateErr } = await supabase.from('PricingSettings').update(settings).eq('projectId', settings.projectId)
        if (!updateErr) return
      } else if (!fetchErr) {
        const { error: insertErr } = await supabase.from('PricingSettings').insert(settings).select()
        if (!insertErr) return
      }
    }
  } catch {}
  try {
    const raw = localStorage.getItem(lsKey('pricing', uid))
    const all: PricingSettings[] = raw ? JSON.parse(raw) : []
    const idx = all.findIndex(p => p.projectId === settings.projectId)
    if (idx >= 0) all[idx] = settings
    else all.push(settings)
    localStorage.setItem(lsKey('pricing', uid), JSON.stringify(all))
  } catch {}
}

// ─── OKR ─────────────────────────────────────────────────────────────────────

export async function getOKRs(projectId: string): Promise<OKR[]> {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { data, error } = await supabase.from('OKR').select('*').eq('projectId', projectId).eq('ownerId', session.user.id)
      if (!error && data) return data as OKR[]
    }
  } catch {}
  return getLocal<OKR>('okrs', [], uid).filter(o => o.projectId === projectId)
}

export async function saveOKR(okr: any) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      let result
      if (okr.id && !okr.id.startsWith('o-')) {
        result = await supabase.from('OKR').update(okr).eq('id', okr.id).eq('ownerId', session.user.id)
      } else {
        result = await supabase.from('OKR').insert({ ...okr, ownerId: session.user.id, id: undefined }).select()
      }
      if (!result.error) return
    }
  } catch {}
  const all = getLocal<OKR>('okrs', [], uid)
  if (okr.id && all.find(o => o.id === okr.id)) {
    const idx = all.findIndex(o => o.id === okr.id)
    if (idx >= 0) all[idx] = { ...all[idx], ...okr }
  } else {
    all.push({ ...okr, id: 'o-' + Date.now() })
  }
  setLocal('okrs', all, uid)
}

export async function deleteOKR(id: string) {
  let uid: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    uid = session?.user?.id || null
    if (session) {
      const { error } = await supabase.from('OKR').delete().eq('id', id).eq('ownerId', session.user.id)
      if (!error) return
    }
  } catch {}
  const all = getLocal<OKR>('okrs', [], uid).filter(o => o.id !== id)
  setLocal('okrs', all, uid)
}

// ─── Export helper (Unit Economics) ──────────────────────────────────────────

export function getUnitEconomicsDefaults() {
  return calculateUnitEconomics({
    totalMarketingCost: 15000000, newCustomers: 120, arpu: 250000, grossMarginPct: 80, churnRatePct: 3.2, mrr: 24800000
  })
}
