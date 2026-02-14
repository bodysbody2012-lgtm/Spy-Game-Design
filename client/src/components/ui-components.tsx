import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function NeonButton({ 
  className, 
  variant = "primary", 
  isLoading, 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "danger" | "ghost",
  isLoading?: boolean 
}) {
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] hover:-translate-y-1 active:translate-y-0",
    secondary: "bg-secondary hover:bg-secondary/80 text-white border border-white/10 hover:border-primary/50",
    danger: "bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    ghost: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function InputField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
        className
      )}
      {...props}
    />
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out w-full max-w-md mx-auto">
      {children}
    </div>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8 space-y-2">
      <h1 className="text-4xl md:text-5xl font-black text-white">
        {title}
      </h1>
      {subtitle && <p className="text-gray-400 font-medium">{subtitle}</p>}
    </div>
  );
}
