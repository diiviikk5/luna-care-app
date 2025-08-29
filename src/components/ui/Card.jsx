import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Card = ({ children, className = '', hover = true, gradient = false, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={hover ? { y: -5, scale: 1.02 } : {}}
    className={clsx(
      'rounded-2xl shadow-lg backdrop-blur-sm border border-white/20',
      gradient 
        ? 'bg-gradient-to-br from-white/80 via-pink-50/50 to-purple-50/50' 
        : 'bg-white/90',
      'p-6 transition-all duration-300',
      hover && 'hover:shadow-2xl hover:shadow-pink-100/50',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
)

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={clsx('mb-4 pb-4 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={clsx(
    'text-xl font-bold bg-gradient-to-r from-luna-600 to-pink-600 bg-clip-text text-transparent mb-2', 
    className
  )} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={clsx('text-gray-600 leading-relaxed', className)} {...props}>
    {children}
  </p>
)

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={clsx('space-y-4', className)} {...props}>
    {children}
  </div>
)

export { Card }
export default Card
