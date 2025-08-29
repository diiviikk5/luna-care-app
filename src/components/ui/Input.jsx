import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(({ 
  label, 
  error, 
  icon, 
  className = '', 
  type = 'text',
  ...props 
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full px-4 py-3 rounded-lg border border-gray-300',
            'focus:ring-2 focus:ring-luna-500 focus:border-transparent',
            'placeholder-gray-400 transition-all duration-200',
            'bg-white shadow-sm',
            icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
