import { Schedule, WeekSchedule, ScheduledClass } from '../types'
import jsPDF from 'jspdf'

interface ExportOptions {
  format: 'csv' | 'pdf'
  includeDetails?: boolean
  weekRange?: { start: Date; end: Date }
}

export const exportUtils = {
  exportSchedule: async (schedule: Schedule, options: ExportOptions) => {
    if (options.format === 'csv') {
      return exportToCsv(schedule, options)
    } else {
      return exportToPdf(schedule, options)
    }
  }
}

function exportToCsv(schedule: Schedule, options: ExportOptions): string {
  const rows: string[] = []
  
  // Add header
  rows.push('Date,Period,Class Number,Teacher,Room,Students')
  
  // Process each week
  schedule.weekSchedules.forEach(week => {
    if (options.weekRange) {
      if (week.startDate < options.weekRange.start || week.endDate > options.weekRange.end) {
        return
      }
    }

    week.days.forEach(day => {
      day.classes.forEach(cls => {
        const row = [
          day.date.toISOString().split('T')[0],
          cls.period.toString(),
          cls.classNumber,
          cls.teacher,
          cls.room,
          cls.students.join(';')
        ]
        rows.push(row.join(','))
      })
    })
  })

  return rows.join('\n')
}

async function exportToPdf(schedule: Schedule, options: ExportOptions): Promise<Uint8Array> {
  const doc = new jsPDF()
  const margin = 10
  let y = margin
  const lineHeight = 7
  const headerHeight = 7
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  // Add title with custom styling
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Class Schedule', pageWidth / 2, y, { align: 'center' })
  y += 12

  // Add date range with custom styling
  if (options.weekRange) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const dateRange = `${options.weekRange.start.toLocaleDateString()} - ${options.weekRange.end.toLocaleDateString()}`
    doc.text(dateRange, pageWidth / 2, y, { align: 'center' })
    y += 10
  }

  // Table settings
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const headers = ['Date', 'Period', 'Class', 'Teacher', 'Room', 'Students']
  const colWidths = [25, 15, 30, 30, 20, 60]
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
  const tableX = (pageWidth - tableWidth) / 2 // Center the table

  // Draw table header
  let x = tableX
  const headerY = y

  // Draw header background with gradient
  doc.setFillColor(220, 220, 220)
  doc.rect(tableX, headerY - 5, tableWidth, headerHeight, 'F')
  
  // Draw header text and vertical lines
  doc.setFont('helvetica', 'bold')
  headers.forEach((header, i) => {
    // Draw header text
    doc.text(header, x + 2, y)
    
    // Draw vertical line with shadow effect
    doc.setDrawColor(180, 180, 180)
    doc.line(x, headerY - 5, x, y + 2)
    doc.setDrawColor(150, 150, 150)
    doc.line(x + 0.2, headerY - 4.8, x + 0.2, y + 2.2)
    
    x += colWidths[i]
  })
  
  // Draw final vertical line
  doc.setDrawColor(180, 180, 180)
  doc.line(x, headerY - 5, x, y + 2)
  doc.setDrawColor(150, 150, 150)
  doc.line(x + 0.2, headerY - 4.8, x + 0.2, y + 2.2)
  
  // Draw horizontal line under header with shadow
  doc.setDrawColor(180, 180, 180)
  doc.line(tableX, y + 2, tableX + tableWidth, y + 2)
  doc.setDrawColor(150, 150, 150)
  doc.line(tableX, y + 2.2, tableX + tableWidth, y + 2.2)
  
  y += headerHeight
  doc.setFont('helvetica', 'normal')

  // Helper function to draw row lines with shadow effect
  const drawRowLines = (startY: number, endY: number) => {
    let xPos = tableX
    // Draw vertical lines with shadow
    colWidths.forEach(width => {
      doc.setDrawColor(180, 180, 180)
      doc.line(xPos, startY, xPos, endY)
      doc.setDrawColor(150, 150, 150)
      doc.line(xPos + 0.2, startY, xPos + 0.2, endY)
      xPos += width
    })
    // Draw final vertical line
    doc.setDrawColor(180, 180, 180)
    doc.line(xPos, startY, xPos, endY)
    doc.setDrawColor(150, 150, 150)
    doc.line(xPos + 0.2, startY, xPos + 0.2, endY)
    
    // Draw horizontal line with shadow
    doc.setDrawColor(180, 180, 180)
    doc.line(tableX, endY, tableX + tableWidth, endY)
    doc.setDrawColor(150, 150, 150)
    doc.line(tableX, endY + 0.2, tableX + tableWidth, endY + 0.2)
  }

  // Process each week
  schedule.weekSchedules.forEach(week => {
    if (options.weekRange) {
      if (week.startDate < options.weekRange.start || week.endDate > options.weekRange.end) {
        return
      }
    }

    week.days.forEach(day => {
      day.classes.forEach(cls => {
        // Check if we need a new page
        if (y > pageHeight - margin) {
          // Draw final row lines on current page
          drawRowLines(y - lineHeight, y)
          
          doc.addPage()
          y = margin
          
          // Redraw header on new page
          x = tableX
          doc.setFillColor(220, 220, 220)
          doc.rect(tableX, y - 5, tableWidth, headerHeight, 'F')
          
          doc.setFont('helvetica', 'bold')
          headers.forEach((header, i) => {
            doc.text(header, x + 2, y)
            doc.setDrawColor(180, 180, 180)
            doc.line(x, y - 5, x, y + 2)
            doc.setDrawColor(150, 150, 150)
            doc.line(x + 0.2, y - 4.8, x + 0.2, y + 2.2)
            x += colWidths[i]
          })
          doc.setDrawColor(180, 180, 180)
          doc.line(x, y - 5, x, y + 2)
          doc.setDrawColor(150, 150, 150)
          doc.line(x + 0.2, y - 4.8, x + 0.2, y + 2.2)
          doc.line(tableX, y + 2, tableX + tableWidth, y + 2)
          
          y += headerHeight
          doc.setFont('helvetica', 'normal')
        }

        const rowStartY = y - lineHeight

        // Add row data
        x = tableX
        const row = [
          day.date.toLocaleDateString(),
          cls.period.toString(),
          cls.classNumber.toString(),
          cls.teacher,
          cls.room,
          cls.students.join(', ')
        ]

        row.forEach((cell, i) => {
          const cellX = x + 2
          
          if (i === 5) { // Students column
            const maxWidth = colWidths[i] - 4
            const lines = doc.splitTextToSize(cell, maxWidth)
            doc.text(lines, cellX, y)
            // Adjust y position based on number of lines
            if (lines.length > 1) {
              y += (lines.length - 1) * 5
            }
          } else {
            doc.text(cell, cellX, y)
          }
          x += colWidths[i]
        })

        // Draw row lines with shadow effect
        drawRowLines(rowStartY, y + 2)

        y += lineHeight
      })
    })
  })

  return doc.output('arraybuffer')
}

// Helper function to download the exported file
export function downloadFile(content: string | Uint8Array, filename: string) {
  const blob = new Blob([content], { 
    type: content instanceof Uint8Array ? 'application/pdf' : 'text/csv' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
