import RateComparisonCard from "@/components/rate-comparison-card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-7xl">
        <RateComparisonCard />
      </div>
    </main>
  )
}

