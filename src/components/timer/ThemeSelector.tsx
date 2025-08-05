import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeName, Theme } from "@/types/timer";
import { Waves, TreePine, Flame, Mountain } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  themes: Record<ThemeName, Theme>;
}

export const ThemeSelector = ({ currentTheme, onThemeChange, themes }: ThemeSelectorProps) => {
  const getThemeIcon = (theme: ThemeName) => {
    switch (theme) {
      case 'sea':
        return <Waves className="w-5 h-5" />;
      case 'forest':
        return <TreePine className="w-5 h-5" />;
      case 'woodfire':
        return <Flame className="w-5 h-5" />;
      case 'lake':
        return <Mountain className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Environment</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(themes).map(([key, theme]) => (
          <Button
            key={key}
            variant={currentTheme === key ? "default" : "secondary"}
            onClick={() => onThemeChange(key as ThemeName)}
            className="flex items-center gap-2 h-12 transition-theme"
          >
            {getThemeIcon(key as ThemeName)}
            {theme.displayName}
          </Button>
        ))}
      </div>
    </Card>
  );
};