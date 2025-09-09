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
        return <Waves className="w-6 h-6" />;
      case 'forest':
        return <TreePine className="w-6 h-6" />;
      case 'woodfire':
        return <Flame className="w-6 h-6" />;
      case 'lake':
        return <Mountain className="w-6 h-6" />;
    }
  };

  return (
    <Card className="p-6 bg-card border border-border shadow-sm">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Environment</h3>
          <p className="text-sm text-muted-foreground">Choose your focus atmosphere</p>
        </div>
        
        <div className="space-y-3">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onThemeChange(key as ThemeName)}
              className={`
                w-full p-4 rounded-lg transition-all duration-200 
                border group hover:scale-[1.02] hover:shadow-sm
                ${currentTheme === key 
                  ? 'bg-primary/10 border-primary/30 shadow-sm' 
                  : 'bg-background border-border hover:bg-muted'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  p-3 rounded-lg transition-colors duration-200
                  ${currentTheme === key 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                  }
                `}>
                  {getThemeIcon(key as ThemeName)}
                </div>
                
                <div className="flex-1 text-left">
                  <h4 className={`
                    font-medium transition-colors duration-200
                    ${currentTheme === key ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {theme.displayName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {key === 'sea' && 'Calming ocean waves'}
                    {key === 'forest' && 'Peaceful woodland'}
                    {key === 'woodfire' && 'Cozy warmth'}
                    {key === 'lake' && 'Serene waters'}
                  </p>
                </div>

                {currentTheme === key && (
                  <div className="w-3 h-3 rounded-full bg-primary shadow-md shadow-primary/50" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};