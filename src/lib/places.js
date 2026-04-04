export const placesPhotoUrl = photoId =>
  `https://places.googleapis.com/v1/${photoId}/media?maxWidthPx=400&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
