import { GridWorld as GridWorldType, MDPState } from '@/lib/mdp';
import { GridCell } from './GridCell';

interface GridWorldProps {
  grid: GridWorldType;
  state: MDPState;
  showValues: boolean;
  showPolicy: boolean;
}

export function GridWorld({ grid, state, showValues, showPolicy }: GridWorldProps) {
  // Calculate min/max values for heatmap normalization
  let minValue = Infinity;
  let maxValue = -Infinity;
  
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      if (grid.cells[i][j].type !== 'obstacle') {
        minValue = Math.min(minValue, state.values[i][j]);
        maxValue = Math.max(maxValue, state.values[i][j]);
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid gap-2 p-4 bg-card/50 rounded-xl border border-border backdrop-blur"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(60px, 80px))`,
        }}
      >
        {grid.cells.flat().map((cell) => (
          <GridCell
            key={`${cell.row}-${cell.col}`}
            cell={cell}
            value={state.values[cell.row][cell.col]}
            policy={state.policy[cell.row][cell.col]}
            showValues={showValues}
            showPolicy={showPolicy}
            minValue={minValue}
            maxValue={maxValue}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/30 border border-success"></div>
          <span>Goal (+10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive"></div>
          <span>Negative (-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border border-muted-foreground/30"></div>
          <span>Obstacle</span>
        </div>
      </div>
    </div>
  );
}
