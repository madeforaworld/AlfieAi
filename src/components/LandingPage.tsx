import { Button } from './ui/button';
import { Search, TrendingUp, FileText, Bell, ArrowRight, MapPin, Building2, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-[1600px] mx-auto px-6 pt-20 pb-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-6xl mb-6 tracking-tight">
            London Planning Intelligence<br />for Design Professionals
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover planning applications, understand local trends, and analyze design documents using AI.
            Built for architects, developers, and planners.
          </p>
        </div>

        {/* Hero Map Image */}
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Simulated UK Map with Planning Points */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-4xl">
                {/* Map pins scattered across */}
                {[
                  { x: '25%', y: '30%', color: '#32C8A2' },
                  { x: '45%', y: '25%', color: '#007AFF' },
                  { x: '55%', y: '45%', color: '#32C8A2' },
                  { x: '35%', y: '55%', color: '#FF3B30' },
                  { x: '65%', y: '35%', color: '#007AFF' },
                  { x: '30%', y: '70%', color: '#32C8A2' },
                  { x: '70%', y: '50%', color: '#007AFF' },
                  { x: '50%', y: '60%', color: '#32C8A2' },
                  { x: '60%', y: '70%', color: '#FF3B30' },
                  { x: '40%', y: '40%', color: '#007AFF' },
                ].map((pin, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full shadow-lg animate-pulse"
                    style={{
                      left: pin.x,
                      top: pin.y,
                      backgroundColor: pin.color,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Overlay card */}
            <div className="absolute top-6 left-6 bg-white rounded-xl shadow-xl p-4 max-w-xs">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-[#007AFF]" />
                <span className="text-sm">Camden & Kings Cross</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">127 planning applications</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#32C8A2]" />
                  <span>Approved: 84</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
                  <span>Pending: 35</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                  <span>Refused: 8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <h2 className="text-4xl text-center mb-16 tracking-tight">
            Everything you need to research planning
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: 'Smart Search',
                description: 'Find projects using natural language. "CLT projects in Camden" or "approved schemes by Foster + Partners"',
              },
              {
                icon: FileText,
                title: 'AI Document Analysis',
                description: 'Automatically extract materials, architects, and design intent from Design & Access Statements',
              },
              {
                icon: TrendingUp,
                title: 'Trends & Insights',
                description: 'Understand approval rates, popular materials, and local design patterns with visual analytics',
              },
              {
                icon: Bell,
                title: 'Custom Alerts',
                description: 'Get notified when new applications match your criteria. Never miss a relevant project',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <feature.icon className="w-8 h-8 text-[#007AFF] mb-4" />
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl mb-2 text-[#007AFF]">87,000+</div>
              <p className="text-gray-600">London Planning Applications</p>
            </div>
            <div>
              <div className="text-5xl mb-2 text-[#007AFF]">33</div>
              <p className="text-gray-600">London Boroughs</p>
            </div>
            <div>
              <div className="text-5xl mb-2 text-[#007AFF]">24hrs</div>
              <p className="text-gray-600">Data Refresh Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
