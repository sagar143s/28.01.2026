import { useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export function useLocationTracking() {
  const { user } = useAuth();

  useEffect(() => {
    const trackLocation = async () => {
      try {
        // Get auth token if user is logged in
        let authHeader = '';
        if (user?.uid) {
          const token = await user.getIdToken();
          authHeader = `Bearer ${token}`;
        }

        // Send tracking data to server
        const response = await fetch('/api/users/track-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { 'Authorization': authHeader }),
          },
          body: JSON.stringify({
            pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
          }),
        });

        if (!response.ok) {
          console.error('Failed to track location');
        }
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    // Track location when component mounts
    trackLocation();
  }, [user]);
}
