interface ChangeLogEntry {
  id: string
  timestamp: number
  setting: string
  oldValue: string
  newValue: string
  category: string
}

export function logSettingChange(
  setting: string,
  oldValue: any,
  newValue: any,
  category: string
): ChangeLogEntry {
  const maskSensitiveData = (value: any, settingName: string): string => {
    const lowerSetting = settingName.toLowerCase()
    if (lowerSetting.includes('password') || lowerSetting.includes('key') || lowerSetting.includes('secret')) {
      return '••••••••'
    }
    return String(value)
  }

  const entry: ChangeLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: Date.now(),
    setting,
    oldValue: maskSensitiveData(oldValue, setting),
    newValue: maskSensitiveData(newValue, setting),
    category
  }

  const existingLog = localStorage.getItem('settings-change-log')
  let log: ChangeLogEntry[] = existingLog ? JSON.parse(existingLog) : []
  
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
  log = log.filter(entry => entry.timestamp > ninetyDaysAgo)
  
  log.push(entry)
  
  if (log.length > 500) {
    log = log.slice(-500)
  }
  
  localStorage.setItem('settings-change-log', JSON.stringify(log))
  
  return entry
}

export function getChangeLog(): ChangeLogEntry[] {
  const existingLog = localStorage.getItem('settings-change-log')
  if (!existingLog) return []
  
  const log: ChangeLogEntry[] = JSON.parse(existingLog)
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
  return log.filter(entry => entry.timestamp > ninetyDaysAgo)
}

export function clearChangeLog(): void {
  localStorage.removeItem('settings-change-log')
}
