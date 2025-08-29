import React from 'react'
import { clsx } from 'clsx'

function Button({ children, className = '', loading = false, variant = 'primary', ...props }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-gradient-to-r from-luna-500 to-pink-500 text-white hover:from-luna-600 hover:to-pink-600 focus:ring-luna-300 focus:text-white active:text-white',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300 focus:text-gray-800 active:text-gray-800',
    outline: 'border-2 border-luna-500 text-luna-500 hover:bg-luna-500 hover:text-white focus:bg-luna-500 focus:text-white active:text-white'
  }

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        loading && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : children}
    </button>
  )
}

export default Button
