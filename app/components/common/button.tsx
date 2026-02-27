// Edit your common/button.tsx
export const Button = ({ children, isLoading, className, ...props }: any) => (
  <button 
    {...props}
    disabled={isLoading}
    // We combine the base styles with the incoming className prop
    className={`transition-all active:scale-[0.98] disabled:opacity-50 ${className}`}
  >
    {isLoading ? "Signing in..." : children}
  </button>
);