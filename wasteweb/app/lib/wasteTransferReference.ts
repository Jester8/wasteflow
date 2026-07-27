export const COMMON_EWC_CODES: { code: string; description: string }[] = [
  { code: "17 01 07", description: "Mixed concrete, bricks, tiles and ceramics" },
  { code: "17 02 01", description: "Wood" },
  { code: "17 02 02", description: "Glass" },
  { code: "17 02 03", description: "Plastic" },
  { code: "17 04 05", description: "Iron and steel" },
  { code: "17 05 04", description: "Soil and stones" },
  { code: "17 06 04", description: "Insulation materials" },
  { code: "17 08 02", description: "Gypsum based construction materials" },
  { code: "17 09 04", description: "Mixed construction and demolition waste" },
  { code: "20 03 01", description: "Mixed municipal waste" },
];

export const PHYSICAL_FORMS = ["Solid", "Liquid", "Powder", "Sludge", "Mixed", "Gas"];

export const WEIGHT_UNITS = ["Tonnes", "Kilograms"];

// Disposal (D) and recovery (R) codes from the Waste Framework Directive,
// narrowed to the ones actually relevant to construction/demolition skip
// waste. DEFRA's Receipt of Waste API requires at least one of these per
// EWC code submitted.
export const COMMON_DISPOSAL_RECOVERY_CODES: { code: string; description: string }[] = [
  { code: "R5",  description: "Recycling/reclamation of other inorganic materials" },
  { code: "R4",  description: "Recycling/reclamation of metals" },
  { code: "R3",  description: "Recycling/reclamation of organic substances" },
  { code: "R12", description: "Exchange of waste for treatment by another R-code operation" },
  { code: "R13", description: "Storage pending recovery" },
  { code: "D1",  description: "Deposit into or onto land (e.g. landfill)" },
  { code: "D5",  description: "Specially engineered landfill" },
  { code: "D15", description: "Storage pending disposal" },
];

export type WasteTransferRecord = {
  ewcCode: string;
  wasteDescription: string;
  physicalForm: string;
  isHazardous: boolean;
  weightAmount: string;
  weightUnit: string;
  weightEstimated: boolean;
  disposalOrRecoveryCode: string;
  receivingSiteName: string;
  receivingSiteAddress: string;
  receivingSitePostcode: string;
  receivingSiteAuthNumber: string;
  carrierName: string;
  vehicleRegistration: string;
  recordedAt?: any;
};
