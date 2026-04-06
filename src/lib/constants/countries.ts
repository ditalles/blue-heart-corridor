export const BALKAN_COUNTRIES = {
  AL: { name: "Albania", cities: ["Tirana", "Saranda", "Berat", "Vlorë", "Gjirokastër", "Shkodër", "Durrës"] },
  BA: { name: "Bosnia & Herzegovina", cities: ["Sarajevo", "Mostar", "Banja Luka", "Trebinje", "Jajce", "Tuzla"] },
  BG: { name: "Bulgaria", cities: ["Sofia", "Plovdiv", "Veliko Tarnovo", "Varna", "Burgas", "Bansko", "Sozopol"] },
  HR: { name: "Croatia", cities: ["Zagreb", "Split", "Dubrovnik", "Zadar", "Hvar", "Pula", "Rijeka", "Rovinj"] },
  GR: { name: "Greece", cities: ["Athens", "Thessaloniki", "Santorini", "Mykonos", "Crete", "Rhodes", "Corfu", "Meteora"] },
  XK: { name: "Kosovo", cities: ["Pristina", "Prizren", "Peja", "Gjakova"] },
  ME: { name: "Montenegro", cities: ["Kotor", "Budva", "Podgorica", "Herceg Novi", "Ulcinj", "Tivat", "Bar"] },
  MK: { name: "North Macedonia", cities: ["Skopje", "Ohrid", "Bitola", "Mavrovo"] },
  RO: { name: "Romania", cities: ["Bucharest", "Cluj-Napoca", "Brașov", "Sibiu", "Timișoara", "Sighișoara", "Constanța"] },
  RS: { name: "Serbia", cities: ["Belgrade", "Novi Sad", "Niš", "Subotica", "Zlatibor"] },
  SI: { name: "Slovenia", cities: ["Ljubljana", "Bled", "Piran", "Maribor", "Bovec", "Ptuj"] },
} as const;

export type CountryCode = keyof typeof BALKAN_COUNTRIES;

export function getCountryName(code: string): string {
  return BALKAN_COUNTRIES[code as CountryCode]?.name ?? code;
}

export function getCitiesForCountry(code: string): string[] {
  return [...(BALKAN_COUNTRIES[code as CountryCode]?.cities ?? [])];
}

export function getAllCities(): { city: string; country: CountryCode; countryName: string }[] {
  return Object.entries(BALKAN_COUNTRIES).flatMap(([code, { name, cities }]) =>
    cities.map((city) => ({ city, country: code as CountryCode, countryName: name }))
  );
}
