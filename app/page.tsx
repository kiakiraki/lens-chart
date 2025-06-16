import { LensChart } from '@/components/lens-chart';
import { lensData } from '@/data/lenses';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-bold">
              📸 Camera Lens Chart
            </h1>
            <ThemeToggle />
          </div>
        </header>
        
        <main>
          <LensChart lenses={lensData} />
        </main>
        
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Recharts</p>
        </footer>
      </div>
    </div>
  );
}
