import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Progress } from "@/components/ui/progress"

interface ToastWithTimerProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  [key: string]: any;
}

function ToastWithTimer({ id, title, description, action, ...props }: ToastWithTimerProps) {
  const duration = 5000;
  const [progress, setProgress] = useState(100);
  const [remaining, setRemaining] = useState(5);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      const newRemaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      setProgress(newProgress);
      setRemaining(newRemaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Toast {...props}>
      <div className="grid gap-2 flex-1">
        <div className="grid gap-1">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && (
            <ToastDescription>{description}</ToastDescription>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-1 flex-1" />
          <span className="text-xs text-muted-foreground font-mono w-5 text-right">{remaining}s</span>
        </div>
      </div>
      {action}
      <ToastClose />
    </Toast>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastWithTimer
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            {...props}
          />
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}