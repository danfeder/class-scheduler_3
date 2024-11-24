import { useDrop, useDrag } from 'react-dnd'
import { ScheduledClass, BlackoutPeriod } from '../../types'
import { scheduleUtils } from '../../utils/schedule'
import { Tooltip } from '../ui/Tooltip'

interface ScheduleCellProps {
  period: number
  date: Date
  scheduledClass?: ScheduledClass
  blackoutPeriods: BlackoutPeriod[]
  isBeforeStartDate: boolean
  onClassClick?: (scheduledClass: ScheduledClass) => void
  onClassDrop?: (classId: string, period: number, date: Date) => void
  onPeriodClick?: (period: number, date: Date) => void
  constraintSatisfaction?: number // 0-1 score for constraint satisfaction
}

export function ScheduleCell({
  period,
  date,
  scheduledClass,
  blackoutPeriods,
  isBeforeStartDate,
  onClassClick,
  onClassDrop,
  onPeriodClick,
  constraintSatisfaction = 1
}: ScheduleCellProps) {
  const isBlackout = blackoutPeriods.some(
    bp => bp.dayOfWeek === date.getDay() && 
         bp.period === period &&
         scheduleUtils.isSameDay(bp.date, date)
  )

  // Drag configuration for scheduled class
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'scheduledClass',
    item: scheduledClass,
    canDrag: !!scheduledClass && !isBeforeStartDate,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [scheduledClass, isBeforeStartDate])

  // Drop configuration for receiving classes
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'scheduledClass',
    canDrop: () => !isBeforeStartDate && !isBlackout,
    drop: (item: ScheduledClass) => {
      onClassDrop?.(item.id, period, date)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [period, date, isBeforeStartDate, isBlackout])

  // Get background color based on state
  const getBgColor = () => {
    if (isBlackout) return 'bg-destructive/10 hover:bg-destructive/20'
    if (isDragging) return 'bg-primary/50'
    if (isOver && canDrop) return 'bg-primary/20'
    if (scheduledClass) {
      // Color based on constraint satisfaction
      const alpha = Math.max(0.3, constraintSatisfaction)
      return `bg-primary hover:bg-primary/90 bg-opacity-${Math.floor(alpha * 100)}`
    }
    return 'bg-secondary/20 hover:bg-secondary/30'
  }

  const cell = (
    <div
      ref={drop}
      className={`
        p-3 rounded-md cursor-pointer transition-colors
        ${getBgColor()}
        ${isDragging ? 'opacity-50' : ''}
        ${isOver && canDrop ? 'ring-2 ring-primary' : ''}
        ${scheduledClass ? 'text-primary-foreground' : 'text-secondary-foreground'}
      `}
      onClick={() => {
        if (scheduledClass && onClassClick) {
          onClassClick(scheduledClass)
        } else if (onPeriodClick) {
          onPeriodClick(period, date)
        }
      }}
    >
      <div className="text-sm font-medium">Period {period}</div>
      {scheduledClass && (
        <div ref={drag} className="mt-2 space-y-1">
          <div className="text-sm font-medium">
            Class {scheduledClass.classNumber}
          </div>
          <div className="text-xs">
            {scheduledClass.teacher}
          </div>
          <div className="text-xs">
            {scheduledClass.gradeLevel === 'mixed'
              ? 'Mixed Grades'
              : `Grade ${scheduledClass.gradeLevel}`}
          </div>
          {constraintSatisfaction < 1 && (
            <div className="text-xs text-destructive-foreground bg-destructive/20 px-1.5 py-0.5 rounded">
              {Math.floor(constraintSatisfaction * 100)}% optimal
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Add tooltip if there are constraint issues
  if (scheduledClass && constraintSatisfaction < 1) {
    return (
      <Tooltip 
        content={
          <div className="space-y-1">
            <div className="font-medium">Constraint Issues</div>
            <div className="text-sm">This class placement has some constraint violations.</div>
            <div className="text-sm text-destructive-foreground">
              {Math.floor((1 - constraintSatisfaction) * 100)}% suboptimal
            </div>
          </div>
        }
      >
        {cell}
      </Tooltip>
    )
  }

  return cell
}
