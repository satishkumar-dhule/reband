/**
 * Code Theme Selector Component
 * Dropdown/popover for selecting syntax highlighting themes
 */

import { useState, useRef, useEffect } from 'react';
import { useCodeTheme, CODE_THEMES, POPULAR_THEMES, type CodeThemeId, type CodeTheme } from '../hooks/useCodeTheme';
import { Palette, Check, Monitor, ChevronDown } from 'lucide-react';

interface CodeThemeSelectorProps {
  variant?: 'dropdown' | 'compact';
  showAutoOption?: boolean;
}

export function CodeThemeSelector({ variant = 'dropdown', showAutoOption = true }: CodeThemeSelectorProps) {
  const { codeTheme, setCodeTheme, resolvedTheme, isAuto } = useCodeTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (themeId: CodeThemeId) => {
    setCodeTheme(themeId);
    setIsOpen(false);
  };

  const displayTheme = isAuto ? resolvedTheme : CODE_THEMES.find(t => t.id === codeTheme);

  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md hover:bg-muted transition-colors border border-border/50"
          title="Code theme"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{displayTheme?.name || 'Auto'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
            <CompactThemeList
              currentTheme={codeTheme}
              onSelect={handleSelect}
              showAutoOption={showAutoOption}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors border border-border/50"
        title="Change code theme"
      >
        <div
          className="w-4 h-4 rounded-sm border border-border/30"
          style={{ background: displayTheme?.preview.background }}
        />
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-medium">
            {isAuto ? 'Auto' : displayTheme?.name}
          </span>
          {isAuto && (
            <span className="text-[10px] text-muted-foreground">
              Following system
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden w-80 max-h-[400px] overflow-y-auto">
          <ThemePicker
            currentTheme={codeTheme}
            onSelect={handleSelect}
            showAutoOption={showAutoOption}
          />
        </div>
      )}
    </div>
  );
}

interface ThemeListProps {
  currentTheme: CodeThemeId;
  onSelect: (themeId: CodeThemeId) => void;
  showAutoOption?: boolean;
  themes?: CodeTheme[];
  title?: string;
}

function ThemeList({ currentTheme, onSelect, showAutoOption = true, themes = CODE_THEMES, title }: ThemeListProps) {
  const groupedThemes = {
    dark: themes.filter(t => t.type === 'dark'),
    light: themes.filter(t => t.type === 'light'),
  };

  return (
    <div className="py-1">
      {title && (
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {title}
        </div>
      )}
      
      {showAutoOption && (
        <button
          onClick={() => onSelect('auto')}
          className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors ${
            currentTheme === 'auto' ? 'bg-muted' : ''
          }`}
        >
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-medium">Auto</span>
            <span className="text-[10px] text-muted-foreground">Follow system preference</span>
          </div>
          {currentTheme === 'auto' && <Check className="w-4 h-4 ml-auto text-primary" />}
        </button>
      )}

      <div className="px-3 py-1.5 mt-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-t border-border/50">
        Dark Themes
      </div>
      {groupedThemes.dark.map((theme) => (
        <ThemeItem
          key={theme.id}
          theme={theme}
          isSelected={currentTheme === theme.id}
          onSelect={() => onSelect(theme.id)}
        />
      ))}

      <div className="px-3 py-1.5 mt-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-t border-border/50">
        Light Themes
      </div>
      {groupedThemes.light.map((theme) => (
        <ThemeItem
          key={theme.id}
          theme={theme}
          isSelected={currentTheme === theme.id}
          onSelect={() => onSelect(theme.id)}
        />
      ))}
    </div>
  );
}

function CompactThemeList({ currentTheme, onSelect, showAutoOption = true }: Omit<ThemeListProps, 'themes' | 'title'>) {
  const popularThemes = CODE_THEMES.filter(t => POPULAR_THEMES.includes(t.id));

  return (
    <div className="py-1">
      {showAutoOption && (
        <button
          onClick={() => onSelect('auto')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted transition-colors text-xs ${
            currentTheme === 'auto' ? 'bg-muted text-primary' : 'text-muted-foreground'
          }`}
        >
          <Monitor className="w-3 h-3" />
          <span>Auto</span>
          {currentTheme === 'auto' && <Check className="w-3 h-3 ml-auto" />}
        </button>
      )}
      <div className="px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
        Popular
      </div>
      {popularThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted transition-colors text-xs ${
            currentTheme === theme.id ? 'bg-muted text-primary' : ''
          }`}
        >
          <div
            className="w-3 h-3 rounded-sm border border-border/30"
            style={{ background: theme.preview.background }}
          />
          <span>{theme.name}</span>
          {currentTheme === theme.id && <Check className="w-3 h-3 ml-auto" />}
        </button>
      ))}
    </div>
  );
}

function ThemePicker({ currentTheme, onSelect, showAutoOption = true }: Omit<ThemeListProps, 'themes' | 'title'>) {
  return <ThemeList currentTheme={currentTheme} onSelect={onSelect} showAutoOption={showAutoOption} />;
}

function ThemeItem({ theme, isSelected, onSelect }: { theme: CodeTheme; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      {/* Mini preview */}
      <div
        className="w-8 h-8 rounded-md border border-border/30 overflow-hidden flex-shrink-0"
        style={{ background: theme.preview.background }}
      >
        <div className="h-full flex flex-col justify-center px-1 gap-0.5">
          <div className="h-1 rounded-sm" style={{ background: theme.preview.keyword, width: '60%' }} />
          <div className="h-1 rounded-sm" style={{ background: theme.preview.string, width: '80%' }} />
          <div className="h-1 rounded-sm" style={{ background: theme.preview.comment, width: '40%' }} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-0.5 min-w-0">
        <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
          {theme.name}
        </span>
        <span className="text-[10px] text-muted-foreground truncate">
          {theme.description}
        </span>
      </div>

      {isSelected && (
        <Check className="w-4 h-4 ml-auto text-primary flex-shrink-0" />
      )}
    </button>
  );
}

// Inline mini selector for use in code block headers
export function InlineCodeThemeSelector() {
  const { codeTheme, setCodeTheme, resolvedTheme, isAuto } = useCodeTheme();
  const [showPicker, setShowPicker] = useState(false);

  const cycleThemes = () => {
    const themes = ['auto', 'vsc-dark-plus', 'vs', 'one-dark', 'ghcolors', 'night-owl'];
    const currentIndex = themes.indexOf(codeTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCodeTheme(themes[nextIndex] as CodeThemeId);
  };

  return (
    <button
      onClick={cycleThemes}
      className="group flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-white/10 transition-all"
      title={`Theme: ${isAuto ? 'Auto' : resolvedTheme.name} (click to cycle)`}
    >
      <Palette className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">
        {isAuto ? 'AUTO' : resolvedTheme.name.split(' ')[0].toUpperCase()}
      </span>
    </button>
  );
}
