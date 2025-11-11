// services/countryService.ts
import { type ICountry } from "~/types/interfaces/ICountryInterfaces";

export const fetchCountries = async (params: Record<string, any> = {}): Promise<ICountry[]> => {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 400));

  // Hardcoded country list
  const countries: ICountry[] = [
    { id: 1, name: "Malawi", iso3: "MWI", continent_id: 1 },
    { id: 2, name: "Zambia", iso3: "ZMB", continent_id: 1 }
  ];

  return Promise.resolve(countries);
};