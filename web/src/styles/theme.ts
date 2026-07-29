import { CSSProperties } from 'react'

export const colors = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  danger: '#e94560',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  bg: '#f1f5f9',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  inputBg: '#f8fafc',
}

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
}

export const input: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginBottom: 12,
  borderRadius: 6,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  boxSizing: 'border-box',
  background: colors.inputBg,
  color: colors.text,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

export const btn: CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

export const btnPrimary: CSSProperties = { ...btn, background: colors.accent, color: '#fff' }
export const btnSuccess: CSSProperties = { ...btn, background: colors.success, color: '#fff' }
export const btnDanger: CSSProperties = { ...btn, background: colors.danger, color: '#fff' }
export const btnWarning: CSSProperties = { ...btn, background: colors.warning, color: '#fff' }
export const btnGhost: CSSProperties = { ...btn, background: 'transparent', color: colors.textSecondary, border: `1px solid ${colors.border}` }

export const th: CSSProperties = { padding: 12, borderBottom: `2px solid ${colors.border}`, color: colors.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }
export const td: CSSProperties = { padding: 12, color: colors.text, fontSize: 14 }

export const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 16,
  background: colors.card,
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: shadows.sm,
}

export const overlay: CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
  alignItems: 'center', zIndex: 1000, padding: 20, boxSizing: 'border-box',
}

export const modal: CSSProperties = {
  background: colors.card, padding: 24, borderRadius: 12,
  width: 600, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: shadows.xl,
}

export const label: CSSProperties = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, color: colors.text }

export const badge = (variant: 'success' | 'danger' | 'warning' | 'info' = 'info'): CSSProperties => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: variant === 'success' ? '#d1fae5' : variant === 'danger' ? '#fee2e2' : variant === 'warning' ? '#fef3c7' : '#dbeafe',
  color: variant === 'success' ? '#065f46' : variant === 'danger' ? '#991b1b' : variant === 'warning' ? '#92400e' : '#1e40af',
})

export const card: CSSProperties = {
  background: colors.card,
  padding: 24,
  borderRadius: 12,
  boxShadow: shadows.md,
  border: `1px solid ${colors.border}`,
}

export const pageHeader: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: 24,
}

export const pageTitle: CSSProperties = { fontSize: 24, fontWeight: 700, color: colors.text, margin: 0 }

export const emptyState: CSSProperties = {
  textAlign: 'center', padding: 40, color: colors.textSecondary,
  fontSize: 14,
}
