import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Spark</h1>
        <p className="text-muted-foreground">Your app starts here</p>
        <Button>Get Started</Button>
      </div>
    </div>
  );
}
