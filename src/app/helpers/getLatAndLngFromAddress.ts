import axios from 'axios';
import config from '../config';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

const getLatAndLngFromAddress = async (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${config.googleMapsApiKey}`;

  try {
    const { data } = await axios.get(url);

    if (data?.status === 'OK') {
      const result = data.results[0];
      const location = result?.geometry?.location;

      return {
        address: result?.formatted_address,
        latitude: location?.lat,
        longitude: location?.lng,
      };
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Geocoding failed: ${data?.status}`,
      );
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error in setting up request: ${error}`,
    );
  }
};

export default getLatAndLngFromAddress;
