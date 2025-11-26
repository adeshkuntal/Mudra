import React from "react";

const Button = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  size = "default",
  children,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl",
    outline: "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow hover:shadow-md",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    link: "text-blue-600 underline-offset-4 hover:underline bg-transparent",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 py-1.5 text-sm rounded-md",
    lg: "h-12 px-8 py-3 text-lg rounded-lg",
    icon: "h-10 w-10 p-0",
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${className}`;
  
  return (
    <button className={combinedClassName} ref={ref} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
