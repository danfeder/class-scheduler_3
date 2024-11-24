import { useState, useCallback } from 'react'
import { Schedule, ScheduledClass, Class, ScheduleConstraints, SchedulePreferences, BlackoutPeriod } from '../types'
import { ScheduleDisplay } from './ScheduleDisplay'
import { scheduleUtils } from '../utils/schedule'

const DEFAULT_CONSTRAINTS: ScheduleConstraints = {
  maxPeriodsPerDay: 8,
  maxPeriodsPerWeek: 40,
  consecutivePeriods: {
    maximum: 2,
    requireBreak: 1
  }
}

interface ScheduleGeneratorProps {
  classes: Class[]
  constraints?: ScheduleConstraints
  preferences: SchedulePreferences
  startDate: Date
  blackoutPeriods: BlackoutPeriod[]
}

export function ScheduleGenerator({
  classes,
  constraints = DEFAULT_CONSTRAINTS,
  preferences,
  startDate,
  blackoutPeriods
}: ScheduleGeneratorProps) {
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSchedule = useCallback(async () => {
    try {
      setError(null)
      setIsGenerating(true)
      console.log('Starting schedule generation with:', {
        classes: classes.length,
        constraints,
        preferences,
        startDate,
        blackoutPeriods: blackoutPeriods.length
      })
      
      if (classes.length === 0) {
        setError("No classes available to schedule")
        return
      }

      // Use setTimeout to allow React to update the UI
      setTimeout(async () => {
        try {
          console.log('Calling generateSchedule...')
          const schedule = await scheduleUtils.generateSchedule(
            classes,
            startDate,
            constraints,
            preferences,
            blackoutPeriods
          )
          console.log('Schedule generated successfully:', schedule)

          // Calculate end date as 6 weeks from start
          const endDate = new Date(startDate.getTime() + 6 * 7 * 24 * 60 * 60 * 1000)
          
          const finalSchedule = {
            ...schedule,
            startDate: startDate,
            endDate: endDate
          }
          console.log('Setting generated schedule:', finalSchedule)
          setGeneratedSchedule(finalSchedule)
        } catch (err) {
          console.error('Error during schedule generation:', err)
          console.error('Error details:', {
            name: err instanceof Error ? err.name : 'Unknown',
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : 'No stack trace'
          })
          setError(err instanceof Error ? `${err.name}: ${err.message}` : 'Failed to generate schedule')
        } finally {
          console.log('Schedule generation completed')
          setIsGenerating(false)
        }
      }, 0)
    } catch (err) {
      console.error('Error initiating schedule generation:', err)
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      })
      setError(err instanceof Error ? `${err.name}: ${err.message}` : 'Failed to start schedule generation')
      setIsGenerating(false)
    }
  }, [classes, startDate, constraints, preferences, blackoutPeriods])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Generated Schedule</h3>
        <button
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          className={`px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors ${
            isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating schedule...</p>
        </div>
      )}

      {!isGenerating && generatedSchedule ? (
        <div className="bg-card rounded-lg p-4">
          <ScheduleDisplay
            schedule={generatedSchedule}
            startDate={startDate}
            blackoutPeriods={blackoutPeriods}
            onBlackoutChange={() => {}} // Read-only display
          />
        </div>
      ) : !isGenerating && !error && (
        <div className="text-center py-8 text-muted-foreground">
          Click "Generate Schedule" to create a new schedule based on your constraints and preferences.
        </div>
      )}
    </div>
  )
}
