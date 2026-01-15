import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function MDPInfo() {
  return (
    <Card className="bg-card/50 border-border backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          MDP Formulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium text-foreground mb-1">States (S)</h4>
          <p className="text-muted-foreground">
            Each cell in the 4×4 grid represents a state. Total: 16 states (12 accessible).
          </p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium text-foreground mb-1">Actions (A)</h4>
          <div className="flex gap-2 flex-wrap">
            {['↑ Up', '↓ Down', '← Left', '→ Right'].map((action) => (
              <span
                key={action}
                className="px-2 py-1 bg-secondary rounded text-secondary-foreground text-xs font-mono"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium text-foreground mb-1">Transition Model P(s'|s,a)</h4>
          <ul className="text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-primary font-mono">80%</span>
              <span>moves in intended direction</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-warning font-mono">10%</span>
              <span>moves perpendicular (each side)</span>
            </li>
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium text-foreground mb-1">Rewards (R)</h4>
          <ul className="text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-success font-mono font-bold">+10</span>
              <span>reaching goal state</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-destructive font-mono font-bold">-10</span>
              <span>falling into negative terminal</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono">-0.1</span>
              <span>living penalty (each step)</span>
            </li>
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium text-foreground mb-1">Algorithms</h4>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <span className="text-primary font-medium">Value Iteration:</span> Iteratively updates state values using Bellman optimality equation until convergence.
            </p>
            <p>
              <span className="text-primary font-medium">Policy Iteration:</span> Alternates between policy evaluation (computing V for fixed π) and policy improvement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
