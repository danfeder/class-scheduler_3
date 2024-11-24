import { useState } from 'react'
import { GradeGroupBuilder } from './GradeGroupBuilder'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { 
  ScheduleConstraints, 
  SchedulePreferences, 
  Class, 
  GradeProgressionPreference,
  MaxConsecutivePeriods,
  ConsecutiveBreakLength
} from '../types'

const DEFAULT_CONSTRAINTS: ScheduleConstraints = {
  maxPeriodsPerDay: 8,
  maxPeriodsPerWeek: 40,
  consecutivePeriods: {
    maximum: 2,
    requireBreak: 1
  }
}

interface ScheduleConstraintsFormProps {
  initialConstraints: ScheduleConstraints
  initialPreferences: SchedulePreferences
  initialStartDate: Date
  classes: Class[]
  onSubmit: (data: {
    constraints: ScheduleConstraints
    preferences: SchedulePreferences
    startDate: Date
  }) => void
}

export function ScheduleConstraintsForm({
  initialConstraints,
  initialPreferences,
  initialStartDate,
  classes,
  onSubmit
}: ScheduleConstraintsFormProps) {
  // Constraint state
  const [maxPeriodsPerDay, setMaxPeriodsPerDay] = useState(
    initialConstraints.maxPeriodsPerDay || DEFAULT_CONSTRAINTS.maxPeriodsPerDay
  )
  const [maxPeriodsPerWeek, setMaxPeriodsPerWeek] = useState(
    initialConstraints.maxPeriodsPerWeek || DEFAULT_CONSTRAINTS.maxPeriodsPerWeek
  )
  const [maxConsecutivePeriods, setMaxConsecutivePeriods] = useState<MaxConsecutivePeriods>(
    initialConstraints.consecutivePeriods.maximum || DEFAULT_CONSTRAINTS.consecutivePeriods.maximum
  )
  const [requiredBreak, setRequiredBreak] = useState<ConsecutiveBreakLength>(
    initialConstraints.consecutivePeriods.requireBreak || DEFAULT_CONSTRAINTS.consecutivePeriods.requireBreak
  )

  // Preference state
  const [startDate, setStartDate] = useState(initialStartDate)
  const [gradeGroups, setGradeGroups] = useState(initialPreferences.gradeGroups)
  const [preferSameGradeInDay, setPreferSameGradeInDay] = useState(
    initialPreferences.preferSameGradeInDay
  )
  const [gradeProgression, setGradeProgression] = useState<GradeProgressionPreference>(
    initialPreferences.gradeProgression
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      constraints: {
        maxPeriodsPerDay,
        maxPeriodsPerWeek,
        consecutivePeriods: {
          maximum: maxConsecutivePeriods,
          requireBreak: requiredBreak
        }
      },
      preferences: {
        gradeGroups,
        preferSameGradeInDay,
        gradeProgression
      },
      startDate
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <h2 className="text-lg font-semibold mb-4">Schedule Constraints</h2>
        
        {/* Basic constraints */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Maximum Periods Per Day
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={maxPeriodsPerDay}
              onChange={(e) => setMaxPeriodsPerDay(parseInt(e.target.value))}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Maximum Periods Per Week
            </label>
            <input
              type="number"
              min="1"
              max="40"
              value={maxPeriodsPerWeek}
              onChange={(e) => setMaxPeriodsPerWeek(parseInt(e.target.value))}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        {/* Consecutive period settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-md font-medium">Consecutive Period Rules</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Consecutive Periods
            </label>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="maxConsecutive"
                  value="1"
                  checked={maxConsecutivePeriods === 1}
                  onChange={() => setMaxConsecutivePeriods(1)}
                  className="mr-2"
                />
                <span>No consecutive periods</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="maxConsecutive"
                  value="2"
                  checked={maxConsecutivePeriods === 2}
                  onChange={() => setMaxConsecutivePeriods(2)}
                  className="mr-2"
                />
                <span>Allow two consecutive periods</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Required Break After Consecutive Periods
            </label>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="requiredBreak"
                  value="1"
                  checked={requiredBreak === 1}
                  onChange={() => setRequiredBreak(1)}
                  className="mr-2"
                />
                <span>One period break</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="requiredBreak"
                  value="2"
                  checked={requiredBreak === 2}
                  onChange={() => setRequiredBreak(2)}
                  className="mr-2"
                />
                <span>Two period break</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Schedule Preferences</h2>
        
        {/* Grade progression */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium mb-2">
            Grade Progression Preference
          </label>
          <select
            value={gradeProgression}
            onChange={(e) => setGradeProgression(e.target.value as GradeProgressionPreference)}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="none">No preference</option>
            <option value="high-to-low">Schedule higher grades first</option>
            <option value="low-to-high">Schedule lower grades first</option>
          </select>
        </div>

        {/* Same grade in day preference */}
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={preferSameGradeInDay}
              onChange={(e) => setPreferSameGradeInDay(e.target.checked)}
              className="mr-2"
            />
            <span>Prefer scheduling same grade levels on the same day</span>
          </label>
        </div>

        {/* Grade groups */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Grade Groups</h3>
          <GradeGroupBuilder
            gradeGroups={gradeGroups}
            onChange={setGradeGroups}
            availableGrades={Array.from(new Set(classes.map(c => c.gradeLevel)))}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Schedule Timing</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          Save Schedule Settings
        </Button>
      </div>
    </form>
  )
}