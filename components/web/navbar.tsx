import { ThemeToggle } from "@/components/web/theme-toggle";

export default function Navbar() {
  return (
    <nav className="  flex items-center justify-between rounded-full border bg-background/70 backdrop-blur px-6 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-violet-500 to-pink-500" />
        <span className="text-xl font-bold">Droply</span>
      </div>

      <ThemeToggle />
    </nav>
  );
}
