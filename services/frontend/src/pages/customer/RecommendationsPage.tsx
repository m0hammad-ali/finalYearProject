import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { api, formatPrice } from '@/lib/utils';

interface Recommendation {
  spec_id: string;
  relevance_score: number;
  laptop?: {
    model_id: string;
    model_name: string;
    brand_name: string;
    series?: string;
    processor_model?: string;
    ram_gb?: number;
    storage_capacity_gb?: number;
    gpu_type?: string;
    min_price?: number;
  };
  reasons?: string[];
}

/**
 * AI Recommendations Page - Customer Portal
 *
 * Interactive form for AI-powered laptop recommendations.
 * HCI: Progressive form, clear feedback, minimal cognitive load.
 */
export function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    budget: { min: '', max: '' },
    usage: searchParams.get('usage') || '',
    ram: '',
    storage: '',
    gpu: '',
    portability: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Pre-fill usage from URL parameter
  useEffect(() => {
    const usage = searchParams.get('usage');
    if (usage) {
      setPreferences(prev => ({ ...prev, usage }));
    }
  }, [searchParams]);

  const usageOptions = [
    { value: 'gaming', label: 'Gaming', description: 'High-performance GPU, high refresh rate' },
    { value: 'programming', label: 'Programming', description: 'Good CPU, plenty of RAM' },
    { value: 'design', label: 'Design & Creative', description: 'Color-accurate display, GPU acceleration' },
    { value: 'office', label: 'Office Work', description: 'Balanced performance, portability' },
    { value: 'student', label: 'Student', description: 'Budget-friendly, all-rounder' },
  ];

  const handleGetRecommendations = async () => {
    try {
      setLoading(true);
      
      // Map usage to API format
      const usageMap: Record<string, string> = {
        gaming: 'Gaming',
        programming: 'Programming',
        design: 'Design',
        office: 'Office',
        student: 'Student',
      };

      // Build preferences for API
      const apiPreferences: any = {};
      
      if (preferences.budget.max) {
        apiPreferences.max_budget = parseFloat(preferences.budget.max);
      }
      if (preferences.budget.min) {
        apiPreferences.min_budget = parseFloat(preferences.budget.min);
      }
      if (preferences.usage) {
        apiPreferences.primary_usage = usageMap[preferences.usage] || 'General';
      }
      if (preferences.ram) {
        apiPreferences.min_ram_gb = parseInt(preferences.ram, 10);
      }
      if (preferences.gpu) {
        apiPreferences.preferred_gpu_type = preferences.gpu as 'Integrated' | 'Dedicated';
      }

      // Call API for recommendations
      const data = await api.getRecommendations(apiPreferences, 5);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      // Fallback to usage-based recommendations
      if (preferences.usage) {
        try {
          const data = await api.getByUsage(preferences.usage, 5);
          setRecommendations(data.map((item: any) => ({
            spec_id: item.model_id,
            relevance_score: 0.8,
            laptop: item,
          })));
        } catch (fallbackErr) {
          console.error('Fallback error:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
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
                {['8', '16', '32', '64'].map((ram) => (
                  <Badge
                    key={ram}
                    variant={preferences.ram === ram ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setPreferences({ ...preferences, ram })}
                  >
                    {ram}GB
                  </Badge>
                ))}
              </div>
            </div>

            {/* GPU Type */}
            <div className="space-y-2">
              <Label>GPU Type</Label>
              <div className="flex flex-wrap gap-2">
                {['Integrated', 'Dedicated'].map((gpu) => (
                  <Badge
                    key={gpu}
                    variant={preferences.gpu === gpu ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setPreferences({ ...preferences, gpu })}
                  >
                    {gpu}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              className="w-full" 
              variant="gold" 
              onClick={handleGetRecommendations}
              disabled={loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
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
                : 'Fill in your preferences and click "Get Recommendations"'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                      <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-muted rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your preferences and click "Get Recommendations"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={rec.spec_id || index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="gold">#{index + 1} Match</Badge>
                            <Badge variant="secondary">{rec.laptop?.brand_name || 'Unknown'}</Badge>
                          </div>
                          <h3 className="text-xl font-bold">{rec.laptop?.model_name || 'Unknown Model'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rec.laptop?.processor_model || 'N/A'} • {rec.laptop?.ram_gb || 'N/A'}GB RAM • {rec.laptop?.storage_capacity_gb || 'N/A'}GB • {rec.laptop?.gpu_type || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gulhaji-green">
                            {rec.laptop?.min_price ? formatPrice(rec.laptop.min_price) : 'Contact Vendor'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Match: {Math.round((rec.relevance_score || 0) * 100)}%
                          </div>
                          <Button className="mt-2" variant="gold" size="sm" asChild>
                            <a href={`/product/${rec.laptop?.model_id || '#'}`}>
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
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
