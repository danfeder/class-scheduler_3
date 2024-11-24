import { useState } from 'react'
import { GradeGroup, Class } from '../types'

const STANDARD_GRADES = ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th']

export interface GradeGroupBuilderProps {
  gradeGroups: GradeGroup[]
  onChange: (groups: GradeGroup[]) => void
  availableGrades: string[]
}

export function GradeGroupBuilder({
  gradeGroups,
  onChange,
  availableGrades
}: GradeGroupBuilderProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState('')

  const unusedGrades = availableGrades.filter(
    grade => !gradeGroups.some(group => group.grades.includes(grade))
  )

  const handleCreateGroup = () => {
    if (selectedGrades.length > 0) {
      const newGroup: GradeGroup = {
        id: Math.random().toString(36).substring(2),
        name: newGroupName || selectedGrades.join(' + '),
        grades: selectedGrades
      }
      onChange([...gradeGroups, newGroup])
      setSelectedGrades([])
      setNewGroupName('')
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    onChange(gradeGroups.filter(group => group.id !== groupId))
  }

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    )
  }

  const handleUpdateGroupName = (groupId: string, newName: string) => {
    onChange(
      gradeGroups.map(group =>
        group.id === groupId
          ? { ...group, name: newName || group.grades.join(' + ') }
          : group
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Available Grades Pool */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Available Grade Levels
        </label>
        <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg min-h-[60px]">
          {unusedGrades.map(grade => (
            <button
              key={grade}
              onClick={() => handleGradeToggle(grade)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedGrades.includes(grade)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground hover:bg-card/80'
              }`}
            >
              {grade}
            </button>
          ))}
          {unusedGrades.length === 0 && (
            <p className="text-sm text-muted-foreground">
              All grades have been grouped
            </p>
          )}
        </div>
      </div>

      {/* Create Group Button */}
      {selectedGrades.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">
                Selected: {selectedGrades.join(' + ')}
              </p>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group Name (optional)"
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
            </div>
            <button
              onClick={handleCreateGroup}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      {/* Existing Groups */}
      {gradeGroups.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Grade Groups
          </label>
          <div className="space-y-2">
            {gradeGroups.map(group => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg"
              >
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                    className="bg-transparent border-none p-0 font-medium focus:outline-none focus:ring-0 w-full"
                    placeholder={group.grades.join(' + ')}
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {group.grades.map(grade => (
                      <span
                        key={grade}
                        className="px-2 py-0.5 bg-muted rounded text-xs"
                      >
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="ml-2 p-1 text-destructive hover:text-destructive/80"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}