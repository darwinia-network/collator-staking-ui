import { ButtonHTMLAttributes, forwardRef } from "react";

export default forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }>(
  function ScaleButton({ children, className, busy, ...rest }, ref) {
    return (
      <button
        className={`relative transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60 data-[disabled=true]:scale-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 ${className}`}
        ref={ref}
        {...rest}
      >
        {busy && (
          <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-b-white/50 border-l-white/50 border-r-white border-t-white" />
          </div>
        )}
        {children}
      </button>
    );
  }
);
