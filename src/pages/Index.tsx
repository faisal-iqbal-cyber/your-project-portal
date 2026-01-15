import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createDefaultGrid,
  initializeMDPState,
  valueIterationStep,
  policyIterationStep,
  type GridWorld as GridWorldType,
  type MDPState,
} from '@/lib/mdp';
import { GridWorld } from '@/components/GridWorld';
import { ControlPanel } from '@/components/ControlPanel';
import { MDPInfo } from '@/components/MDPInfo';
import { Brain } from 'lucide-react';

const Index = () => {
  const [grid] = useState<GridWorldType>(createDefaultGrid);
  const [state, setState] = useState<MDPState>(() => initializeMDPState(grid));
  const [algorithm, setAlgorithm] = useState<'value' | 'policy'>('value');
  const [gamma, setGamma] = useState(0.9);
  const [isRunning, setIsRunning] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [showPolicy, setShowPolicy] = useState(true);
  
  const intervalRef = useRef<number | null>(null);

  const runStep = useCallback(() => {
    setState((prev) => {
      if (prev.converged) return prev;
      
      if (algorithm === 'value') {
        return valueIterationStep(grid, prev, gamma);
      } else {
        return policyIterationStep(grid, prev, gamma);
      }
    });
  }, [grid, algorithm, gamma]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setState(initializeMDPState(grid));
  }, [grid]);

  const handleToggleRun = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleRunToConvergence = useCallback(() => {
    let currentState = state;
    let iterations = 0;
    const maxIterations = 1000;
    
    while (!currentState.converged && iterations < maxIterations) {
      if (algorithm === 'value') {
        currentState = valueIterationStep(grid, currentState, gamma);
      } else {
        currentState = policyIterationStep(grid, currentState, gamma);
      }
      iterations++;
    }
    
    setState(currentState);
  }, [state, grid, algorithm, gamma]);

  const handleAlgorithmChange = useCallback((newAlgorithm: 'value' | 'policy') => {
    setAlgorithm(newAlgorithm);
    setIsRunning(false);
    setState(initializeMDPState(grid));
  }, [grid]);

  const handleGammaChange = useCallback((newGamma: number) => {
    setGamma(newGamma);
    setIsRunning(false);
    setState(initializeMDPState(grid));
  }, [grid]);

  // Auto-run effect
  useEffect(() => {
    if (isRunning && !state.converged) {
      intervalRef.current = window.setInterval(runStep, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (state.converged) {
        setIsRunning(false);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, state.converged, runStep]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                MDP Grid-World Visualization
              </h1>
              <p className="text-sm text-muted-foreground">
                Value Iteration & Policy Iteration Algorithms
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Left: Grid Visualization */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <GridWorld
                grid={grid}
                state={state}
                showValues={showValues}
                showPolicy={showPolicy}
              />
            </div>
            
            {/* Algorithm Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card/50 border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Value Iteration</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Updates values using Bellman equation</li>
                  <li>• Policy extracted after convergence</li>
                  <li>• Simple but may need many iterations</li>
                </ul>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Policy Iteration</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Alternates evaluation & improvement</li>
                  <li>• Often converges in fewer iterations</li>
                  <li>• Each iteration is more expensive</li>
                </ul>
              </div>
            </div>
            
            {/* MDP Info Card */}
            <MDPInfo />
          </div>

          {/* Right: Control Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ControlPanel
              algorithm={algorithm}
              onAlgorithmChange={handleAlgorithmChange}
              gamma={gamma}
              onGammaChange={handleGammaChange}
              isRunning={isRunning}
              onToggleRun={handleToggleRun}
              onStep={runStep}
              onReset={handleReset}
              onRunToConvergence={handleRunToConvergence}
              iteration={state.iteration}
              converged={state.converged}
              delta={state.delta}
              showValues={showValues}
              onShowValuesChange={setShowValues}
              showPolicy={showPolicy}
              onShowPolicyChange={setShowPolicy}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Markov Decision Process Visualization • AI Course Assignment
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
