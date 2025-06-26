import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  icon = false,
  className = ''
}) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-300 flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/20",
    secondary: "bg-white text-blue-900 hover:bg-gray-100 border border-gray-200",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50"
  };
  
  const sizeStyles = {
    sm: "text-xs py-2 px-3",
    md: "text-sm py-3 px-5",
    lg: "text-base py-4 px-8"
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
      {icon && <ArrowRight className="ml-2 h-4 w-4" />}
    </button>
  );
};

export default Button;