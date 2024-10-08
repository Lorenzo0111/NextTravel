import {
  findTrips,
  getTrip,
  getTripCheckoutLink,
  getTrips,
} from "travelpayouts";
import type { AttractionsRequest } from "../../../ai/tools";
import type { AttractionManager } from "../../attractions";
import type { Attraction } from "../../types";

export class WeGoTrip implements AttractionManager {
  provider = "wegotrip";

  async search(data: AttractionsRequest): Promise<Attraction[]> {
    const locations = await findTrips(data.location);
    const location = locations.filter((loc) => loc.type === "city")[0];
    if (!location) return [];

    const trips = await getTrips(location.id);

    return trips.map((trip) => ({
      id: `${this.provider}_${trip.id}`,
      name: trip.title,
      location: trip.city.name,
      price: trip.price,
      image: trip.cover,
      rating: trip.rating,
    }));
  }

  async get(id: string): Promise<Attraction | undefined> {
    const trip = await getTrip(Number.parseInt(id));
    if (!trip) return undefined;
    const checkout = await getTripCheckoutLink(trip.id);

    return {
      id: `${this.provider}_${trip.id}`,
      name: trip.title,
      location: trip.city.name,
      price: trip.price,
      image: trip.cover,
      rating: trip.rating,
      checkoutUrl: checkout,
    };
  }
}
