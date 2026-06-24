export function formatDateBR(dateVal?: string | Date | null): string {
  if (!dateVal) return ''
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal
  if (Number.isNaN(d.getTime())) {
    if (/^\d{4}$/.test(String(dateVal))) {
      return `01/01/${dateVal}`
    }
    return String(dateVal)
  }
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export function formatToISO(dateVal?: string | null): string {
  if (!dateVal) return ''
  const trimmed = dateVal.trim()
  if (!trimmed) return ''
  // Se já está em formato ISO (YYYY-MM-DD), retorna
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed
  // Converte de DD/MM/YYYY para ISO
  const parts = trimmed.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month}-${day}`
  }
  return trimmed
}

export function formatToDateInput(dateVal?: string | null): string {
  if (!dateVal) return ''
  const trimmed = dateVal.trim()
  if (!trimmed) return ''
  // Se está em DD/MM/YYYY, retorna
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) return trimmed
  // Converte de ISO (YYYY-MM-DD) para DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-')
    return `${day}/${month}/${year}`
  }
  return trimmed
}

export function maskDateInput(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
}
