
type GeoTrackingData = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  mediaId?: string;
  userId?: string;
  interactionType: 'view' | 'click' | 'qr_scan';
};

export const trackGeolocation = async (
  mediaId: string, 
  userId: string | undefined,
  interactionType: 'view' | 'click' | 'qr_scan'
): Promise<GeoTrackingData | null> => {
  try {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const trackingData: GeoTrackingData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            mediaId,
            userId,
            interactionType
          };

          // Log the tracking data
          console.log('Geolocation tracked:', trackingData);

          // In a production environment, you would send this to your backend
          // For now, we're just returning the data
          resolve(trackingData);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  } catch (error) {
    console.error('Geolocation tracking error:', error);
    return null;
  }
};

export const requestGeolocationPermission = async (): Promise<boolean> => {
  try {
    if (!navigator.geolocation) {
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false)
      );
    });
  } catch (error) {
    console.error('Error requesting geolocation permission:', error);
    return false;
  }
};
