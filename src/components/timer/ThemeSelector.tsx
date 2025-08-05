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
    <Card className="p-6 backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Environment</h3>
          <p className="text-sm text-foreground/70">Choose your focus atmosphere</p>
        </div>
        
        <div className="space-y-3">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onThemeChange(key as ThemeName)}
              className={`
                w-full p-4 rounded-xl backdrop-blur-md transition-all duration-300 
                border border-white/20 group hover:scale-105 hover:bg-white/20
                ${currentTheme === key 
                  ? 'bg-white/25 border-white/40 shadow-lg shadow-primary/20' 
                  : 'bg-white/10 hover:bg-white/15'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  p-3 rounded-lg backdrop-blur-sm transition-colors duration-300
                  ${currentTheme === key 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-white/10 text-foreground/80 group-hover:bg-white/20'
                  }
                `}>
                  {getThemeIcon(key as ThemeName)}
                </div>
                
                <div className="flex-1 text-left">
                  <h4 className={`
                    font-medium transition-colors duration-300
                    ${currentTheme === key ? 'text-foreground' : 'text-foreground/80'}
                  `}>
                    {theme.displayName}
                  </h4>
                  <p className="text-xs text-foreground/60 mt-1">
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