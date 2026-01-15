import { Cell, Action } from '@/lib/mdp';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target, Skull, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridCellProps {
  cell: Cell;
  value: number;
  policy: Action;
  showValues: boolean;
  showPolicy: boolean;
  minValue: number;
  maxValue: number;
}

const ArrowIcon = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
};

function getHeatmapColor(value: number, min: number, max: number): string {
  if (max === min) return 'hsl(38, 92%, 50%)';
  
  const normalized = (value - min) / (max - min);
  
  // Red (negative) -> Yellow (neutral) -> Green (positive)
  if (normalized < 0.5) {
    const t = normalized * 2;
    const h = 0 + t * 38; // Red to Yellow
    return `hsl(${h}, 72%, ${45 + t * 10}%)`;
  } else {
    const t = (normalized - 0.5) * 2;
    const h = 38 + t * (142 - 38); // Yellow to Green
    return `hsl(${h}, 72%, ${55 - t * 10}%)`;
  }
}

export function GridCell({
  cell,
  value,
  policy,
  showValues,
  showPolicy,
  minValue,
  maxValue,
}: GridCellProps) {
  const isTerminal = cell.type === 'goal' || cell.type === 'negative';
  const isObstacle = cell.type === 'obstacle';
  const Arrow = ArrowIcon[policy];
  
  const bgColor = isObstacle
    ? 'hsl(var(--obstacle))'
    : isTerminal
    ? undefined
    : showValues
    ? getHeatmapColor(value, minValue, maxValue)
    : 'hsl(var(--card))';

  return (
    <div
      className={cn(
        'grid-cell aspect-square relative flex flex-col items-center justify-center rounded-md transition-all duration-300',
        cell.type === 'goal' && 'grid-cell-goal glow-success',
        cell.type === 'negative' && 'grid-cell-negative glow-destructive',
        cell.type === 'obstacle' && 'grid-cell-obstacle',
        !isTerminal && !isObstacle && 'hover:scale-105'
      )}
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Cell type icons */}
      {cell.type === 'goal' && (
        <Target className="w-8 h-8 text-success animate-pulse-subtle" />
      )}
      {cell.type === 'negative' && (
        <Skull className="w-8 h-8 text-destructive animate-pulse-subtle" />
      )}
      {cell.type === 'obstacle' && (
        <Square className="w-8 h-8 text-muted-foreground/50" fill="currentColor" />
      )}
      
      {/* Policy arrow for non-terminal, non-obstacle cells */}
      {!isTerminal && !isObstacle && showPolicy && (
        <Arrow className="w-6 h-6 policy-arrow animate-fade-in" />
      )}
      
      {/* Value display */}
      {showValues && (
        <span
          className={cn(
            'value-text absolute bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[10px]',
            isTerminal ? 'bg-background/80' : 'bg-background/60',
            'text-foreground'
          )}
        >
          {value.toFixed(2)}
        </span>
      )}
      
      {/* Cell reward indicator for terminal states */}
      {isTerminal && (
        <span className="absolute top-1 right-1 text-[10px] font-mono font-bold">
          {cell.reward > 0 ? '+' : ''}{cell.reward}
        </span>
      )}
    </div>
  );
}
