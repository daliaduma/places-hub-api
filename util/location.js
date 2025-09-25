import axios from "axios";
import HttpError from "../models/http-error.js";

const API_KEY = process.env.GOOGLE_API_KEY;
const getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`,
  );
  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("Could not get location data", 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
};

export default getCoordsForAddress;
