import { Button } from "@/components/ui/button"

export default function page() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Athaar</h1>
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}