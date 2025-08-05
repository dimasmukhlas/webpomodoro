import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { TimerState } from "@/types/timer";

interface TimerControlsProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
}

export const TimerControls = ({
  timerState,
  onStart,
  onPause,
  onReset,
  onOpenSettings
}: TimerControlsProps) => {
  const { isRunning } = timerState;

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={isRunning ? onPause : onStart}
          size="lg"
          className="h-16 w-16 rounded-full"
          variant="default"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>
        
        <Button
          onClick={onReset}
          size="lg"
          variant="secondary"
          className="h-12 w-12 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={onOpenSettings}
          size="lg"
          variant="secondary"
          className="h-12 w-12 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};