import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        
        return (
          <div key={i} className="flex items-center">
            <div className="relative flex flex-col items-center">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${isCompleted 
                    ? "bg-primary border-primary text-white" 
                    : isCurrent 
                      ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                      : "border-muted-foreground/30 text-muted-foreground"}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span 
                className={`
                  absolute -bottom-6 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                  ${isCurrent ? "text-primary" : "text-muted-foreground"}
                `}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div 
                className={`w-12 h-[2px] mx-2 transition-colors duration-500 ${
                  i < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                }`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
