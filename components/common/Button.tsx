import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = "px-6 py-3 font-bold rounded-lg shadow-lg transition-all transform duration-200 ease-in-out hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variantClasses = {
    primary: "bg-primary hover:bg-primary-dark text-slate-900 focus:ring-primary",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 focus:ring-slate-500",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};