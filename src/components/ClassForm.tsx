import { useState, useEffect } from 'react'
import { Class, DayConflicts } from '../types'

interface ClassFormProps {
  onSubmit: (classData: Class) => void
  onCancel?: () => void
  initialClass?: Class | null
}

interface JsonClass {
  class: string
  teacher: string
  grade: string
  days: {
    [key: string]: number[]
  }
}

const DAYS = [
  { name: 'Monday', number: 1 },
  { name: 'Tuesday', number: 2 },
  { name: 'Wednesday', number: 3 },
  { name: 'Thursday', number: 4 },
  { name: 'Friday', number: 5 }
]

const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1)

export function ClassForm({ onSubmit, onCancel, initialClass }: ClassFormProps) {
  const [classNumber, setClassNumber] = useState(initialClass?.classNumber || '')
  const [teacher, setTeacher] = useState(initialClass?.teacher || '')
  const [gradeLevel, setGradeLevel] = useState(initialClass?.gradeLevel || '5th')
  const [totalConflicts, setTotalConflicts] = useState<DayConflicts[]>(
    initialClass?.totalConflicts || 
    DAYS.map(day => ({ dayOfWeek: day.number, periods: [] }))
  )
  const [partialConflicts, setPartialConflicts] = useState<DayConflicts[]>(
    initialClass?.partialConflicts || 
    DAYS.map(day => ({ dayOfWeek: day.number, periods: [] }))
  )
  const [uploadedClasses, setUploadedClasses] = useState<JsonClass[]>([])
  const [currentClassIndex, setCurrentClassIndex] = useState<number>(-1)

  // Update form state when initialClass changes
  useEffect(() => {
    if (initialClass) {
      setClassNumber(initialClass.classNumber)
      setTeacher(initialClass.teacher)
      setGradeLevel(initialClass.gradeLevel)
      setTotalConflicts(initialClass.totalConflicts)
      setPartialConflicts(initialClass.partialConflicts)
    } else {
      // Reset form when initialClass becomes null
      setClassNumber('')
      setTeacher('')
      setGradeLevel('5th')
      setTotalConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
      setPartialConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
    }
  }, [initialClass])

  const gradeLevels = ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', 'mixed']

  const gradeMap: { [key: string]: string } = {
    "Pre-K": "Pre-K",
    "K": "K",
    "1st Grade": "1st",
    "2nd Grade": "2nd",
    "3rd Grade": "3rd",
    "4th Grade": "4th",
    "5th Grade": "5th"
  }

  const loadClassData = (classData: JsonClass) => {
    setClassNumber(classData.class)
    setTeacher(classData.teacher)
    setGradeLevel(gradeMap[classData.grade] || classData.grade)

    const newTotalConflicts = DAYS.map(day => {
      const periods = classData.days[day.name] || []
      return {
        dayOfWeek: day.number,
        periods: periods
      }
    })
    setTotalConflicts(newTotalConflicts)
    setPartialConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        console.log('Parsed JSON data:', jsonData) // Debug log
        
        const classes = jsonData.schedule as JsonClass[]
        if (!classes?.length) {
          alert('No classes found in the JSON file. Make sure it has a "schedule" array.')
          return
        }
        
        console.log(`Found ${classes.length} classes in JSON`) // Debug log
        setUploadedClasses(classes)
        setCurrentClassIndex(0)
        loadClassData(classes[0])

        // Offer to submit all classes at once
        if (classes.length > 1) {
          const submitAll = window.confirm(
            `Found ${classes.length} classes. Would you like to add them all at once? ` +
            `Click OK to add all classes, or Cancel to add them one by one.`
          )
          if (submitAll) {
            handleSubmitAll()
          }
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error)
        alert('Error parsing JSON file. Please make sure the file format is correct and contains a "schedule" array.')
      }
    }
    reader.readAsText(file)
  }

  const handleSubmitAll = () => {
    if (!uploadedClasses.length) return
    
    console.log(`Submitting all ${uploadedClasses.length} classes`) // Debug log
    uploadedClasses.forEach(classData => {
      const newTotalConflicts = DAYS.map(day => ({
        dayOfWeek: day.number,
        periods: classData.days[day.name] || []
      }))

      const newClass: Class = {
        id: Math.random().toString(36).substring(2),
        classNumber: classData.class,
        teacher: classData.teacher,
        gradeLevel: gradeMap[classData.grade] || classData.grade,
        totalConflicts: newTotalConflicts,
        partialConflicts: DAYS.map(day => ({ dayOfWeek: day.number, periods: [] }))
      }

      onSubmit(newClass)
    })

    // Reset form after submitting all
    setClassNumber('')
    setTeacher('')
    setGradeLevel('5th')
    setTotalConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
    setPartialConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
    setUploadedClasses([])
    setCurrentClassIndex(-1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const classData: Class = {
      id: initialClass?.id || Math.random().toString(36).substring(2),
      classNumber,
      teacher,
      gradeLevel,
      totalConflicts,
      partialConflicts
    }

    onSubmit(classData)

    if (currentClassIndex >= 0 && currentClassIndex < uploadedClasses.length - 1) {
      // Load next class
      setCurrentClassIndex(prev => prev + 1)
      loadClassData(uploadedClasses[currentClassIndex + 1])
    } else {
      // Reset form
      setClassNumber('')
      setTeacher('')
      setGradeLevel('5th')
      setTotalConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
      setPartialConflicts(DAYS.map(day => ({ dayOfWeek: day.number, periods: [] })))
      setUploadedClasses([])
      setCurrentClassIndex(-1)
    }
  }

  const togglePeriod = (dayOfWeek: number, period: number, type: 'total' | 'partial') => {
    if (type === 'total') {
      setTotalConflicts(prev => {
        const dayConflicts = prev.find(d => d.dayOfWeek === dayOfWeek)
        if (!dayConflicts) return prev

        const newPeriods = dayConflicts.periods.includes(period)
          ? dayConflicts.periods.filter(p => p !== period)
          : [...dayConflicts.periods, period]

        return prev.map(d =>
          d.dayOfWeek === dayOfWeek ? { ...d, periods: newPeriods } : d
        )
      })
      // Remove from partial conflicts if it exists
      setPartialConflicts(prev => {
        const dayConflicts = prev.find(d => d.dayOfWeek === dayOfWeek)
        if (!dayConflicts) return prev

        return prev.map(d =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, periods: d.periods.filter(p => p !== period) }
            : d
        )
      })
    } else {
      setPartialConflicts(prev => {
        const dayConflicts = prev.find(d => d.dayOfWeek === dayOfWeek)
        if (!dayConflicts) return prev

        const newPeriods = dayConflicts.periods.includes(period)
          ? dayConflicts.periods.filter(p => p !== period)
          : [...dayConflicts.periods, period]

        return prev.map(d =>
          d.dayOfWeek === dayOfWeek ? { ...d, periods: newPeriods } : d
        )
      })
      // Remove from total conflicts if it exists
      setTotalConflicts(prev => {
        const dayConflicts = prev.find(d => d.dayOfWeek === dayOfWeek)
        if (!dayConflicts) return prev

        return prev.map(d =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, periods: d.periods.filter(p => p !== period) }
            : d
        )
      })
    }
  }

  const toggleEntireDay = (dayOfWeek: number, type: 'total' | 'partial') => {
    const conflicts = type === 'total' ? totalConflicts : partialConflicts
    const dayConflicts = conflicts.find(d => d.dayOfWeek === dayOfWeek)
    const hasAllPeriods = dayConflicts && dayConflicts.periods.length === PERIODS.length

    if (type === 'total') {
      setTotalConflicts(prev => {
        return prev.map(d =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, periods: hasAllPeriods ? [] : PERIODS }
            : d
        )
      })
      // Remove from partial conflicts if adding all periods
      if (!hasAllPeriods) {
        setPartialConflicts(prev => {
          return prev.map(d =>
            d.dayOfWeek === dayOfWeek ? { ...d, periods: [] } : d
          )
        })
      }
    } else {
      setPartialConflicts(prev => {
        return prev.map(d =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, periods: hasAllPeriods ? [] : PERIODS }
            : d
        )
      })
      // Remove from total conflicts if adding all periods
      if (!hasAllPeriods) {
        setTotalConflicts(prev => {
          return prev.map(d =>
            d.dayOfWeek === dayOfWeek ? { ...d, periods: [] } : d
          )
        })
      }
    }
  }

  const togglePeriodAllDays = (period: number, type: 'total' | 'partial') => {
    const conflicts = type === 'total' ? totalConflicts : partialConflicts
    const allDaysHavePeriod = DAYS.every(day => 
      conflicts.find(d => d.dayOfWeek === day.number)?.periods.includes(period)
    )

    if (type === 'total') {
      setTotalConflicts(prev => {
        return prev.map(d => ({
          ...d,
          periods: allDaysHavePeriod
            ? d.periods.filter(p => p !== period)
            : [...new Set([...d.periods, period])]
        }))
      })
      // Remove from partial conflicts if adding
      if (!allDaysHavePeriod) {
        setPartialConflicts(prev => {
          return prev.map(d => ({
            ...d,
            periods: d.periods.filter(p => p !== period)
          }))
        })
      }
    } else {
      setPartialConflicts(prev => {
        return prev.map(d => ({
          ...d,
          periods: allDaysHavePeriod
            ? d.periods.filter(p => p !== period)
            : [...new Set([...d.periods, period])]
        }))
      })
      // Remove from total conflicts if adding
      if (!allDaysHavePeriod) {
        setTotalConflicts(prev => {
          return prev.map(d => ({
            ...d,
            periods: d.periods.filter(p => p !== period)
          }))
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Class Number</label>
            <input
              type="text"
              value={classNumber}
              onChange={e => setClassNumber(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Teacher</label>
            <input
              type="text"
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Grade Level</label>
            <select
              value={gradeLevel}
              onChange={e => setGradeLevel(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Import from JSON</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded-md bg-white"
          />
          {uploadedClasses.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                Loaded {uploadedClasses.length} classes. Currently viewing class {currentClassIndex + 1}.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentClassIndex > 0) {
                      setCurrentClassIndex(prev => prev - 1)
                      loadClassData(uploadedClasses[currentClassIndex - 1])
                    }
                  }}
                  disabled={currentClassIndex <= 0}
                  className="px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
                >
                  Previous Class
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentClassIndex < uploadedClasses.length - 1) {
                      setCurrentClassIndex(prev => prev + 1)
                      loadClassData(uploadedClasses[currentClassIndex + 1])
                    }
                  }}
                  disabled={currentClassIndex >= uploadedClasses.length - 1}
                  className="px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
                >
                  Next Class
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Submit All Classes
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-4">
            Period Conflicts
          </label>
          <div className="grid grid-cols-6 gap-3">
            <div className="w-16">
              <div className="h-8"></div>
              {PERIODS.map(period => (
                <button
                  key={period}
                  type="button"
                  onClick={() => togglePeriodAllDays(period, 'total')}
                  className="px-1.5 py-1 mb-0.5 text-xs rounded bg-muted/50 text-muted-foreground hover:bg-muted/60 w-full"
                >
                  All P{period}
                </button>
              ))}
            </div>
            {DAYS.map(day => (
              <div key={day.number} className="space-y-1">
                <div className="flex justify-between items-center h-8">
                  <div className="font-medium text-sm">{day.name}</div>
                  <button
                    type="button"
                    onClick={() => toggleEntireDay(day.number, 'total')}
                    className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground hover:bg-muted/60"
                  >
                    All Day
                  </button>
                </div>
                <div className="space-y-0.5">
                  {PERIODS.map(period => {
                    const dayConflicts = totalConflicts.find(d => d.dayOfWeek === day.number)
                    const isConflict = dayConflicts?.periods.includes(period) || false
                    return (
                      <div
                        key={period}
                        onClick={() => togglePeriod(day.number, period, 'total')}
                        className={`px-2 py-1 rounded-md text-xs cursor-pointer ${
                          isConflict
                            ? 'bg-destructive/20 text-destructive-foreground hover:bg-destructive/30'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted/60'
                        }`}
                      >
                        P{period}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {initialClass ? 'Save Changes' : 'Add Class'}
        </button>
      </div>
    </form>
  )
}