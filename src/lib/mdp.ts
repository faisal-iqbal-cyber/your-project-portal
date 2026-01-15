// MDP Types and Core Logic

export type CellType = 'empty' | 'goal' | 'negative' | 'obstacle';

export type Action = 'up' | 'down' | 'left' | 'right';

export const ACTIONS: Action[] = ['up', 'down', 'left', 'right'];

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  reward: number;
}

export interface GridWorld {
  rows: number;
  cols: number;
  cells: Cell[][];
  stepReward: number;
  goalReward: number;
  negativeReward: number;
}

export interface MDPState {
  values: number[][];
  policy: Action[][];
  iteration: number;
  converged: boolean;
  delta: number;
}

// Action vectors
const ACTION_DELTAS: Record<Action, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

// Get perpendicular actions for stochastic transitions
function getPerpendicularActions(action: Action): Action[] {
  if (action === 'up' || action === 'down') {
    return ['left', 'right'];
  }
  return ['up', 'down'];
}

// Check if position is valid and not an obstacle
function isValidPosition(grid: GridWorld, row: number, col: number): boolean {
  return (
    row >= 0 &&
    row < grid.rows &&
    col >= 0 &&
    col < grid.cols &&
    grid.cells[row][col].type !== 'obstacle'
  );
}

// Get next position after taking an action
function getNextPosition(
  grid: GridWorld,
  row: number,
  col: number,
  action: Action
): [number, number] {
  const [dr, dc] = ACTION_DELTAS[action];
  const newRow = row + dr;
  const newCol = col + dc;
  
  if (isValidPosition(grid, newRow, newCol)) {
    return [newRow, newCol];
  }
  return [row, col]; // Stay in place if invalid
}

// Calculate expected value for taking an action from a state
export function calculateActionValue(
  grid: GridWorld,
  values: number[][],
  row: number,
  col: number,
  action: Action,
  gamma: number,
  transitionProb: number = 0.8
): number {
  const cell = grid.cells[row][col];
  
  // Terminal states have fixed values
  if (cell.type === 'goal' || cell.type === 'negative') {
    return cell.reward;
  }
  
  let expectedValue = 0;
  const sideProb = (1 - transitionProb) / 2;
  
  // Intended direction
  const [nextRow, nextCol] = getNextPosition(grid, row, col, action);
  const nextCell = grid.cells[nextRow][nextCol];
  const immediateReward = nextCell.type === 'goal' || nextCell.type === 'negative' 
    ? nextCell.reward 
    : grid.stepReward;
  expectedValue += transitionProb * (immediateReward + gamma * values[nextRow][nextCol]);
  
  // Perpendicular directions
  const perpActions = getPerpendicularActions(action);
  for (const perpAction of perpActions) {
    const [perpRow, perpCol] = getNextPosition(grid, row, col, perpAction);
    const perpCell = grid.cells[perpRow][perpCol];
    const perpReward = perpCell.type === 'goal' || perpCell.type === 'negative'
      ? perpCell.reward
      : grid.stepReward;
    expectedValue += sideProb * (perpReward + gamma * values[perpRow][perpCol]);
  }
  
  return expectedValue;
}

// Get best action and its value for a state
export function getBestAction(
  grid: GridWorld,
  values: number[][],
  row: number,
  col: number,
  gamma: number
): { action: Action; value: number } {
  let bestAction: Action = 'up';
  let bestValue = -Infinity;
  
  for (const action of ACTIONS) {
    const value = calculateActionValue(grid, values, row, col, action, gamma);
    if (value > bestValue) {
      bestValue = value;
      bestAction = action;
    }
  }
  
  return { action: bestAction, value: bestValue };
}

// Initialize MDP state
export function initializeMDPState(grid: GridWorld): MDPState {
  const values: number[][] = [];
  const policy: Action[][] = [];
  
  for (let i = 0; i < grid.rows; i++) {
    values[i] = [];
    policy[i] = [];
    for (let j = 0; j < grid.cols; j++) {
      const cell = grid.cells[i][j];
      if (cell.type === 'goal') {
        values[i][j] = grid.goalReward;
      } else if (cell.type === 'negative') {
        values[i][j] = grid.negativeReward;
      } else {
        values[i][j] = 0;
      }
      policy[i][j] = 'up'; // Initial random policy
    }
  }
  
  return {
    values,
    policy,
    iteration: 0,
    converged: false,
    delta: Infinity,
  };
}

// Value Iteration step
export function valueIterationStep(
  grid: GridWorld,
  state: MDPState,
  gamma: number,
  threshold: number = 0.001
): MDPState {
  const newValues: number[][] = state.values.map(row => [...row]);
  const newPolicy: Action[][] = state.policy.map(row => [...row]);
  let maxDelta = 0;
  
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      const cell = grid.cells[i][j];
      
      // Skip terminal states and obstacles
      if (cell.type === 'goal' || cell.type === 'negative' || cell.type === 'obstacle') {
        continue;
      }
      
      const { action, value } = getBestAction(grid, state.values, i, j, gamma);
      newValues[i][j] = value;
      newPolicy[i][j] = action;
      
      const delta = Math.abs(value - state.values[i][j]);
      maxDelta = Math.max(maxDelta, delta);
    }
  }
  
  return {
    values: newValues,
    policy: newPolicy,
    iteration: state.iteration + 1,
    converged: maxDelta < threshold,
    delta: maxDelta,
  };
}

// Policy Evaluation for Policy Iteration
export function policyEvaluation(
  grid: GridWorld,
  values: number[][],
  policy: Action[][],
  gamma: number,
  maxIterations: number = 100,
  threshold: number = 0.001
): number[][] {
  let currentValues = values.map(row => [...row]);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let maxDelta = 0;
    const newValues = currentValues.map(row => [...row]);
    
    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.cols; j++) {
        const cell = grid.cells[i][j];
        
        if (cell.type === 'goal' || cell.type === 'negative' || cell.type === 'obstacle') {
          continue;
        }
        
        const action = policy[i][j];
        const value = calculateActionValue(grid, currentValues, i, j, action, gamma);
        newValues[i][j] = value;
        
        maxDelta = Math.max(maxDelta, Math.abs(value - currentValues[i][j]));
      }
    }
    
    currentValues = newValues;
    
    if (maxDelta < threshold) {
      break;
    }
  }
  
  return currentValues;
}

// Policy Iteration step
export function policyIterationStep(
  grid: GridWorld,
  state: MDPState,
  gamma: number
): MDPState {
  // Policy Evaluation
  const evaluatedValues = policyEvaluation(grid, state.values, state.policy, gamma);
  
  // Policy Improvement
  const newPolicy: Action[][] = state.policy.map(row => [...row]);
  let policyStable = true;
  
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      const cell = grid.cells[i][j];
      
      if (cell.type === 'goal' || cell.type === 'negative' || cell.type === 'obstacle') {
        continue;
      }
      
      const oldAction = state.policy[i][j];
      const { action: newAction } = getBestAction(grid, evaluatedValues, i, j, gamma);
      newPolicy[i][j] = newAction;
      
      if (oldAction !== newAction) {
        policyStable = false;
      }
    }
  }
  
  // Calculate delta for visualization
  let maxDelta = 0;
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      maxDelta = Math.max(maxDelta, Math.abs(evaluatedValues[i][j] - state.values[i][j]));
    }
  }
  
  return {
    values: evaluatedValues,
    policy: newPolicy,
    iteration: state.iteration + 1,
    converged: policyStable,
    delta: maxDelta,
  };
}

// Create default grid world
export function createDefaultGrid(): GridWorld {
  const rows = 4;
  const cols = 4;
  const cells: Cell[][] = [];
  
  const stepReward = -0.1;
  const goalReward = 10;
  const negativeReward = -10;
  
  // Define special cells
  const goalPos = { row: 0, col: 3 };
  const negativePos = { row: 1, col: 3 };
  const obstacles = [{ row: 1, col: 1 }];
  
  for (let i = 0; i < rows; i++) {
    cells[i] = [];
    for (let j = 0; j < cols; j++) {
      let type: CellType = 'empty';
      let reward = stepReward;
      
      if (i === goalPos.row && j === goalPos.col) {
        type = 'goal';
        reward = goalReward;
      } else if (i === negativePos.row && j === negativePos.col) {
        type = 'negative';
        reward = negativeReward;
      } else if (obstacles.some(o => o.row === i && o.col === j)) {
        type = 'obstacle';
        reward = 0;
      }
      
      cells[i][j] = { row: i, col: j, type, reward };
    }
  }
  
  return {
    rows,
    cols,
    cells,
    stepReward,
    goalReward,
    negativeReward,
  };
}
