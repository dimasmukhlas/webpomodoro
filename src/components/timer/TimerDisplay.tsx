import { Card } from "@/components/ui/card";
import { TimerState } from "@/types/timer";
import { formatTime } from "@/utils/timeUtils";
import { Progress } from "@/components/ui/progress";

interface TimerDisplayProps {
  timerState: TimerState;
  totalDuration: number;
}

export const TimerDisplay = ({ timerState, totalDuration }: TimerDisplayProps) => {
  const { timeLeft, isBreak, completedSessions, currentCycle } = timerState;
  
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <Card className="p-8 backdrop-blur-sm bg-card/80 border-border/50 text-center">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </h2>
          <p className="text-muted-foreground">
            Session {currentCycle} • Completed: {completedSessions}
          </p>
        </div>

        <div className="relative">
          {/* Circular Timer */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
                fill="none"
                className="opacity-20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))'
                }}
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isBreak ? 'minutes break' : 'minutes focus'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linear progress bar for reference */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>
    </Card>
  );
};