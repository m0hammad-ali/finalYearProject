import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * AI Recommendations Page - Customer Portal
 * 
 * Interactive form for AI-powered laptop recommendations.
 * HCI: Progressive form, clear feedback, minimal cognitive load.
 */
export function RecommendationsPage() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    budget: { min: '', max: '' },
    usage: '',
    ram: '',
    storage: '',
    gpu: '',
    portability: '',
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const usageOptions = [
    { value: 'gaming', label: 'Gaming', description: 'High-performance GPU, high refresh rate' },
    { value: 'programming', label: 'Programming', description: 'Good CPU, plenty of RAM' },
    { value: 'design', label: 'Design & Creative', description: 'Color-accurate display, GPU acceleration' },
    { value: 'office', label: 'Office Work', description: 'Balanced performance, portability' },
    { value: 'student', label: 'Student', description: 'Budget-friendly, all-rounder' },
  ];

  const handleGetRecommendations = () => {
    // Mock recommendations - would call AI service in production
    setRecommendations([
      {
        id: '1',
        name: 'Lenovo Legion 5',
        brand: 'Lenovo',
        price: 189999,
        matchScore: 95,
        specs: { cpu: 'Ryzen 7', ram: 16, storage: 1024, gpu: 'RTX 4060' },
        reasons: ['Great for gaming', 'Within budget', 'Excellent GPU'],
      },
      {
        id: '2',
        name: 'ASUS ROG Strix',
        brand: 'ASUS',
        price: 199999,
        matchScore: 90,
        specs: { cpu: 'i7-13700H', ram: 16, storage: 512, gpu: 'RTX 4050' },
        reasons: ['Good performance', 'Trusted brand'],
      },
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gulhaji-green/10">
          <Sparkles className="h-8 w-8 text-gulhaji-green" />
        </div>
        <h1 className="text-4xl font-bold">AI Laptop Recommendations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tell us about your needs and our AI will find the perfect laptop for you
          from Gulhaji Plaza's verified vendors.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Preferences Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
            <CardDescription>Tell us what you're looking for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget */}
            <div className="space-y-2">
              <Label>Budget Range (PKR)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={preferences.budget.min}
                  onChange={(e) =>
                    setPreferences({ ...preferences, budget: { ...preferences.budget, min: e.target.value } })
                  }
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={preferences.budget.max}
                  onChange={(e) =>
                    setPreferences({ ...preferences, budget: { ...preferences.budget, max: e.target.value } })
                  }
                />
              </div>
            </div>

            {/* Usage */}
            <div className="space-y-2">
              <Label>Primary Usage</Label>
              <div className="grid gap-2">
                {usageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, usage: option.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      preferences.usage === option.value
                        ? 'border-gulhaji-green bg-gulhaji-green/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* RAM */}
            <div className="space-y-2">
              <Label>Minimum RAM</Label>
              <div className="flex flex-wrap gap-2">
                {['8GB', '16GB', '32GB', '64GB'].map((ram) => (
                  <Badge
                    key={ram}
                    variant={preferences.ram === ram ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setPreferences({ ...preferences, ram })}
                  >
                    {ram}
                  </Badge>
                ))}
              </div>
            </div>

            <Button className="w-full" variant="gold" onClick={handleGetRecommendations}>
              <Sparkles className="mr-2 h-4 w-4" />
              Get Recommendations
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {recommendations.length > 0
                ? `Found ${recommendations.length} Matches`
                : 'Your Recommendations'}
            </CardTitle>
            <CardDescription>
              {recommendations.length > 0
                ? 'Based on your preferences'
                : 'Fill in your preferences to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your preferences and click "Get Recommendations"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={rec.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="gold">#{index + 1} Match</Badge>
                            <Badge variant="secondary">{rec.brand}</Badge>
                          </div>
                          <h3 className="text-xl font-bold">{rec.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rec.specs.cpu} • {rec.specs.ram}GB RAM • {rec.specs.storage}GB • {rec.specs.gpu}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rec.reasons.map((reason: string) => (
                              <Badge key={reason} variant="outline">
                                <Check className="h-3 w-3 mr-1" />
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gulhaji-green">
                            Rs. {rec.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Match: {rec.matchScore}%
                          </div>
                          <Button className="mt-2" variant="gold" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
