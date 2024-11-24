import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseClasses = 'btn'
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      destructive: 'btn-destructive'
    }[variant]

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }[size]

    const widthClass = fullWidth ? 'w-full' : ''

    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`

    return (
      <button
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }