/**
 * Fetches the current GPS coordinates of the user.
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

/**
 * Converts coordinates into a human-readable address (City, State, Pincode)
 * Uses OpenStreetMap (Nominatim) - Free and No API Key required.
 */
export const getReverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept-Language': 'en', // Ensures results are in English
        }
      }
    );
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    if (data && data.address) {
      const { address } = data;
      return {
        city: address.city || address.town || address.village || address.district || '',
        state: address.state || '',
        pincode: address.postcode || ''
      };
    }
    throw new Error("Address not found");
  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    throw new Error("Failed to fetch address details");
  }
};