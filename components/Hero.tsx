export default function Hero({ title }: { title: string }) {
  return (
    <div className="mb-8">
      <div className="h-48 bg-slate-200 rounded-xl mb-4" />
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  )
}
