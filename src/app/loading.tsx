import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return <main className="route-loading" role="status" aria-live="polite">
    <LoaderCircle className="spin" size={34}/>
    <span>Loading FreshCart…</span>
  </main>;
}
