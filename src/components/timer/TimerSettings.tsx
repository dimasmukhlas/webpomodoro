import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimerSettings as TimerSettingsType } from "@/types/timer";
import { X } from "lucide-react";

interface TimerSettingsProps {
  settings: TimerSettingsType;
  onSettingsChange: (settings: TimerSettingsType) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TimerSettings = ({
  settings,
  onSettingsChange,
  onClose,
  isOpen
}: TimerSettingsProps) => {
  if (!isOpen) return null;

  const updateSetting = (key: keyof TimerSettingsType, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card border-border animate-theme-fade">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Timer Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="work-duration">Work Duration (minutes)</Label>
            <Input
              id="work-duration"
              type="number"
              min="1"
              max="60"
              value={settings.workDuration}
              onChange={(e) => updateSetting('workDuration', parseInt(e.target.value) || 25)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short-break">Short Break (minutes)</Label>
            <Input
              id="short-break"
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSetting('shortBreakDuration', parseInt(e.target.value) || 5)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long-break">Long Break (minutes)</Label>
            <Input
              id="long-break"
              type="number"
              min="10"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value) || 30)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessions-before-break">Sessions Before Long Break</Label>
            <Input
              id="sessions-before-break"
              type="number"
              min="2"
              max="10"
              value={settings.sessionsBeforeLongBreak}
              onChange={(e) => updateSetting('sessionsBeforeLongBreak', parseInt(e.target.value) || 4)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sound Effects</Label>
            <Switch
              id="sound-enabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>

          <Button onClick={onClose} className="w-full">
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};