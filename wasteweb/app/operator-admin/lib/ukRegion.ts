export const UK_REGIONS = [
  "London",
  "South East",
  "South West",
  "East of England",
  "East Midlands",
  "West Midlands",
  "North West",
  "North East",
  "Yorkshire and the Humber",
  "Scotland",
  "Wales",
  "Northern Ireland",
];

const POSTCODE_AREA_TO_REGION: Record<string, string> = {
  E: "London", EC: "London", N: "London", NW: "London", SE: "London", SW: "London", W: "London", WC: "London",
  BN: "South East", CT: "South East", GU: "South East", ME: "South East", OX: "South East", PO: "South East",
  RG: "South East", RH: "South East", SL: "South East", SO: "South East", TN: "South East", KT: "South East",
  SM: "South East", CR: "South East", TW: "South East", HP: "South East",
  AL: "East of England", CB: "East of England", CM: "East of England", CO: "East of England", IP: "East of England",
  LU: "East of England", NR: "East of England", PE: "East of England", SG: "East of England", SS: "East of England",
  WD: "East of England",
  BA: "South West", BH: "South West", BS: "South West", DT: "South West", EX: "South West", GL: "South West",
  PL: "South West", SN: "South West", SP: "South West", TA: "South West", TQ: "South West", TR: "South West",
  DE: "East Midlands", LE: "East Midlands", LN: "East Midlands", NG: "East Midlands", NN: "East Midlands",
  B: "West Midlands", CV: "West Midlands", DY: "West Midlands", HR: "West Midlands", ST: "West Midlands",
  SY: "West Midlands", TF: "West Midlands", WR: "West Midlands", WS: "West Midlands", WV: "West Midlands",
  BB: "North West", BL: "North West", CA: "North West", CH: "North West", CW: "North West", FY: "North West",
  L: "North West", LA: "North West", M: "North West", OL: "North West", PR: "North West", SK: "North West",
  WA: "North West", WN: "North West",
  BD: "Yorkshire and the Humber", DN: "Yorkshire and the Humber", HD: "Yorkshire and the Humber",
  HG: "Yorkshire and the Humber", HU: "Yorkshire and the Humber", HX: "Yorkshire and the Humber",
  LS: "Yorkshire and the Humber", S: "Yorkshire and the Humber", WF: "Yorkshire and the Humber",
  YO: "Yorkshire and the Humber",
  DH: "North East", DL: "North East", NE: "North East", SR: "North East", TS: "North East",
  AB: "Scotland", DD: "Scotland", DG: "Scotland", EH: "Scotland", FK: "Scotland", G: "Scotland", HS: "Scotland",
  IV: "Scotland", KA: "Scotland", KW: "Scotland", KY: "Scotland", ML: "Scotland", PA: "Scotland", PH: "Scotland",
  TD: "Scotland", ZE: "Scotland",
  CF: "Wales", LD: "Wales", LL: "Wales", NP: "Wales", SA: "Wales",
  BT: "Northern Ireland",
};

export function deriveRegionFromLocation(location: string): string {
  if (!location) return "Unknown";
  const match = location.toUpperCase().match(/\b([A-Z]{1,2})\d[A-Z\d]?\s*\d[A-Z]{2}\b/);
  if (!match) return "Unknown";
  const area = match[1];
  return POSTCODE_AREA_TO_REGION[area] || "Unknown";
}
