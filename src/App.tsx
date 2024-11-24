import { useEffect, useState } from 'react'
import { ClassForm } from './components/ClassForm'
import { ScheduleConstraintsForm } from './components/ScheduleConstraints'
import { ScheduleDisplay } from './components/ScheduleDisplay'
import { ScheduleGenerator } from './components/ScheduleGenerator'
import {
  Class,
  Schedule,
  ScheduleConstraints,
  SchedulePreferences,
  ScheduledClass,
  BlackoutPeriod
} from './types'
import { storage } from './utils/storage'
import { scheduleUtils } from './utils/schedule'

function App() {
  const [classes, setClasses] = useState<Class[]>(() => {
    const savedClasses = storage.getClasses();
    if (savedClasses.length === 0) {
      storage.initializeSampleData();
      return storage.getClasses();
    }
    return savedClasses;
  })
  const [schedule, setSchedule] = useState<Schedule | undefined>(undefined)
  const [startDate, setStartDate] = useState<Date>(() => new Date())
  const [blackoutPeriods, setBlackoutPeriods] = useState<BlackoutPeriod[]>([])
  const [constraints, setConstraints] = useState<ScheduleConstraints>(() => ({
    maxPeriodsPerDay: 8,
    maxPeriodsPerWeek: 40,
    consecutivePeriods: {
      maximum: 2,
      requireBreak: 1
    }
  }))
  const [preferences, setPreferences] = useState<SchedulePreferences>(() => {
    const savedPreferences = storage.getPreferences();
    return savedPreferences || {
      gradeGroups: [],
      preferSameGradeInDay: true,
      gradeProgression: 'none'
    };
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [activeTab, setActiveTab] = useState<'classes' | 'settings' | 'schedule'>('classes')

  // Save classes whenever they change
  useEffect(() => {
    storage.saveClasses(classes);
  }, [classes]);

  // Save schedule whenever it changes
  useEffect(() => {
    if (schedule) {
      storage.saveSchedule(schedule);
    }
  }, [schedule]);

  // Save preferences whenever they change
  useEffect(() => {
    storage.savePreferences(preferences);
  }, [preferences]);

  const handleSelectClass = (classId: string) => {
    setSelectedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedClasses.size === classes.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(classes.map(c => c.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedClasses.size === 0) return;
    
    const confirmMessage = selectedClasses.size === 1
      ? 'Are you sure you want to delete this class?'
      : `Are you sure you want to delete these ${selectedClasses.size} classes?`;
    
    if (window.confirm(confirmMessage)) {
      setClasses(prevClasses => 
        prevClasses.filter(cls => !selectedClasses.has(cls.id))
      );
      setSelectedClasses(new Set());
    }
  };

  const mixedGradeClasses = classes
    .filter(cls => cls.gradeLevel === 'mixed')
    .map(cls => cls.classNumber)

  const handleAddClass = (classData: Class) => {
    setClasses(prevClasses => [...prevClasses, classData])
  }

  const handleDeleteClass = (classId: string) => {
    setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId))
    setShowDeleteConfirm(null)
  }

  const handleUpdateConstraints = (data: {
    constraints: ScheduleConstraints
    preferences: SchedulePreferences
    startDate: Date
  }) => {
    setStartDate(data.startDate)
    setConstraints(data.constraints)
    setPreferences(data.preferences)
    storage.savePreferences(data.preferences)
  }

  const handleBlackoutChange = (newBlackoutPeriods: BlackoutPeriod[]) => {
    setBlackoutPeriods(newBlackoutPeriods)
    setSchedule(undefined)
  }

  const handleClassClick = (scheduledClass: ScheduledClass) => {
    console.log('Clicked class:', scheduledClass)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Cooking Class Scheduler</h1>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'classes'
                  ? 'bg-card text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Classes ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'settings'
                  ? 'bg-card text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Schedule Settings
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'schedule'
                  ? 'bg-card text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Schedule Preview
            </button>
          </nav>
        </div>

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class List */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Added Classes</h2>
                <div className="space-x-2">
                  {selectedClasses.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    >
                      Delete Selected ({selectedClasses.size})
                    </button>
                  )}
                  {classes.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                    >
                      {selectedClasses.size === classes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[600px] space-y-2">
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    className={`flex items-center p-4 bg-muted rounded-lg hover:bg-muted/90 ${
                      editingClass?.id === cls.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.has(cls.id)}
                      onChange={() => handleSelectClass(cls.id)}
                      className="mr-4 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      onClick={e => e.stopPropagation()}
                    />
                    <div 
                      className="flex-grow cursor-pointer"
                      onClick={() => setEditingClass(cls)}
                    >
                      <div className="font-medium">Class {cls.classNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {cls.teacher} • Grade {cls.gradeLevel}
                      </div>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No classes added yet. Use the form to add classes.
                  </p>
                )}
              </div>
            </div>

            {/* Add/Edit Form */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h2>
              <ClassForm
                onSubmit={(classData) => {
                  if (editingClass) {
                    setClasses(prev =>
                      prev.map(cls =>
                        cls.id === editingClass.id
                          ? { ...classData, id: cls.id }
                          : cls
                      )
                    )
                    setEditingClass(null)
                  } else {
                    setClasses(prev => [...prev, classData])
                  }
                }}
                onCancel={editingClass ? () => setEditingClass(null) : undefined}
                initialClass={editingClass}
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule Settings</h2>
            <ScheduleConstraintsForm
              initialConstraints={constraints}
              initialPreferences={preferences}
              initialStartDate={startDate}
              classes={classes}
              onSubmit={handleUpdateConstraints}
            />
          </div>
        )}

        {/* Schedule Preview Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Blackout Period Selection */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Blackout Periods</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Click on periods to mark them as unavailable for scheduling.
              </p>
              <ScheduleDisplay
                startDate={startDate}
                blackoutPeriods={blackoutPeriods}
                onBlackoutChange={setBlackoutPeriods}
              />
            </div>

            {/* Schedule Generation */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <ScheduleGenerator
                classes={classes}
                constraints={constraints}
                preferences={preferences}
                startDate={startDate}
                blackoutPeriods={blackoutPeriods}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Class</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this class? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setClasses(prev => prev.filter(cls => cls.id !== showDeleteConfirm))
                    setShowDeleteConfirm(null)
                  }}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App