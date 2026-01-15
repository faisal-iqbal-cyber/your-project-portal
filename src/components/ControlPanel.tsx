import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, SkipForward, FastForward } from 'lucide-react';

interface ControlPanelProps {
  algorithm: 'value' | 'policy';
  onAlgorithmChange: (algorithm: 'value' | 'policy') => void;
  gamma: number;
  onGammaChange: (gamma: number) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunToConvergence: () => void;
  iteration: number;
  converged: boolean;
  delta: number;
  showValues: boolean;
  onShowValuesChange: (show: boolean) => void;
  showPolicy: boolean;
  onShowPolicyChange: (show: boolean) => void;
}

export function ControlPanel({
  algorithm,
  onAlgorithmChange,
  gamma,
  onGammaChange,
  isRunning,
  onToggleRun,
  onStep,
  onReset,
  onRunToConvergence,
  iteration,
  converged,
  delta,
  showValues,
  onShowValuesChange,
  showPolicy,
  onShowPolicyChange,
}: ControlPanelProps) {
  return (
    <div className="control-panel space-y-6">
      {/* Algorithm Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Algorithm</Label>
        <Tabs value={algorithm} onValueChange={(v) => onAlgorithmChange(v as 'value' | 'policy')}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="value" className="text-sm">
              Value Iteration
            </TabsTrigger>
            <TabsTrigger value="policy" className="text-sm">
              Policy Iteration
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Discount Factor */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-foreground">
            Discount Factor (γ)
          </Label>
          <span className="font-mono text-sm text-primary font-semibold">
            {gamma.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[gamma]}
          onValueChange={([v]) => onGammaChange(v)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Higher values = more importance on future rewards
        </p>
      </div>

      {/* Playback Controls */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Controls</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onToggleRun}
            variant={isRunning ? 'destructive' : 'default'}
            className="w-full"
            disabled={converged}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run
              </>
            )}
          </Button>
          <Button onClick={onStep} variant="secondary" disabled={converged || isRunning}>
            <SkipForward className="w-4 h-4 mr-2" />
            Step
          </Button>
          <Button onClick={onRunToConvergence} variant="outline" disabled={converged || isRunning}>
            <FastForward className="w-4 h-4 mr-2" />
            Converge
          </Button>
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Display</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-values" className="text-sm text-muted-foreground">
              Show Values (Heatmap)
            </Label>
            <Switch
              id="show-values"
              checked={showValues}
              onCheckedChange={onShowValuesChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-policy" className="text-sm text-muted-foreground">
              Show Policy (Arrows)
            </Label>
            <Switch
              id="show-policy"
              checked={showPolicy}
              onCheckedChange={onShowPolicyChange}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-3 pt-4 border-t border-border">
        <Label className="text-sm font-medium text-foreground">Statistics</Label>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Iteration</p>
            <p className="font-mono text-xl font-bold text-foreground">{iteration}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Max Delta</p>
            <p className="font-mono text-xl font-bold text-foreground">
              {delta === Infinity ? '∞' : delta.toFixed(4)}
            </p>
          </div>
        </div>
        
        {converged && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
            <p className="text-success font-medium">✓ Converged!</p>
          </div>
        )}
      </div>
    </div>
  );
}
