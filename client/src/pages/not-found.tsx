import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, AlertCircle, Compass } from 'lucide-react';
import { Button } from '@/components/unified/Button';

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      setLocation('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, setLocation]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* 404 Visual */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20 mb-6"
          >
            <AlertCircle className="w-16 h-16 text-primary" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-8xl font-black text-primary mb-4"
          >
            404
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground mb-3"
          >
            Page Not Found
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </motion.p>
        </div>

        {/* Auto-redirect notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6 mb-6 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Compass className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-sm text-muted-foreground">
              Redirecting to home page in <span className="font-bold text-primary text-lg mx-1">{countdown}</span> seconds...
            </p>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-2 justify-center"
        >
          <Button
            onClick={() => setLocation('/')}
            variant="primary"
            size="lg"
            icon={<Home className="w-5 h-5" />}
          >
            Go Home Now
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Go Back
          </Button>
          
          <Button
            onClick={() => setLocation('/channels')}
            variant="outline"
            size="lg"
            icon={<Search className="w-5 h-5" />}
          >
            Browse Channels
          </Button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Home', path: '/' },
              { label: 'Channels', path: '/channels' },
              { label: 'Stats', path: '/stats' },
              { label: 'Badges', path: '/badges' },
              { label: 'Coding', path: '/coding' },
              { label: 'About', path: '/about' },
            ].map(link => (
              <Button
                key={link.path}
                onClick={() => setLocation(link.path)}
                variant="ghost"
                size="sm"
                rounded="full"
              >
                {link.label}
              </Button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
