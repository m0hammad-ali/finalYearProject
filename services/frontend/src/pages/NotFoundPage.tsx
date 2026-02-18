import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found Page
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-gulhaji-green">404</h1>
        <div>
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="gold" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
