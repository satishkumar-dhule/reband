import { useEffect } from 'react';

interface PerformanceMonitorProps {
  enabled: boolean;
  reportToConsole: boolean;
  reportToAnalytics: boolean;
}

export default function PerformanceMonitor({ 
  enabled, 
  reportToConsole, 
  reportToAnalytics 
}: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled) return;

    if (reportToConsole) {
      console.log('Performance monitoring enabled');
    }

    // Placeholder for actual performance monitoring logic
    // In a real implementation, this would track vitals, etc.

    return () => {
      // Cleanup
    };
  }, [enabled, reportToConsole, reportToAnalytics]);

  return null; // This component doesn't render anything visible
}