import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setJustCameOnline(true);
      setTimeout(() => setJustCameOnline(false), 3000);
    }
    function handleOffline() {
      setIsOnline(false);
      setJustCameOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !justCameOnline) return null;

  if (justCameOnline) {
    return (
      <div className="offline-banner bg-green-100 text-green-800 flex items-center justify-center gap-2">
        <Wifi className="w-4 h-4" />
        Back online. All features are available.
      </div>
    );
  }

  return (
    <div className="offline-banner bg-yellow-100 text-yellow-800 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      You are offline. Registration Guide and Pricing Calculator still work. AI features need internet.
    </div>
  );
}
