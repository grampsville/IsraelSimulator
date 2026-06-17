import React from 'react';
import { motion } from 'framer-motion';

export default function Button({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const baseClasses = 'font-heebo font-bold rounded-lg cursor-pointer transition-all duration-200 select-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400',
    danger: 'bg-red-700 hover:bg-red-600 text-white border border-red-500',
    success: 'bg-green-700 hover:bg-green-600 text-white border border-green-500',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/20',
    gold: 'bg-yellow-600 hover:bg-yellow-500 text-black border border-yellow-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
    xl: 'px-10 py-4 text-xl',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}
