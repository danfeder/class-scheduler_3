import { useState } from 'react'
import { Schedule } from '../../types'
import { exportUtils, downloadFile } from '../../utils/export'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

interface ExportButtonProps {
  schedule: Schedule
  startDate: Date
  endDate: Date
}

export function ExportButton({ schedule, startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf', exportRange: 'current' | 'all' = 'current') => {
    try {
      setIsExporting(true)
      const content = await exportUtils.exportSchedule(schedule, {
        format,
        weekRange: exportRange === 'current' ? { start: startDate, end: endDate } : undefined
      })

      const filename = exportRange === 'current'
        ? `schedule-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.${format}`
        : `complete-schedule.${format}`

      downloadFile(content, filename)
    } catch (error) {
      console.error('Failed to export schedule:', error)
      // You might want to show a toast notification here
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('csv', 'current')}>
          Export Current Week (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf', 'current')}>
          Export Current Week (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv', 'all')}>
          Export Complete Schedule (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf', 'all')}>
          Export Complete Schedule (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
