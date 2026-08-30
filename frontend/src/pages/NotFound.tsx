import { Link } from "react-router-dom";
import { GuideMark } from "../components/GuideMark";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <GuideMark size={36} />
      <h1 className="font-display font-bold text-2xl">Page not found</h1>
      <p className="text-sm text-white/50 [html.light_&]:text-ink-2/50">This step isn't on the roadmap.</p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  );
}
