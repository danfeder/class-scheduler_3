import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-sm p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}