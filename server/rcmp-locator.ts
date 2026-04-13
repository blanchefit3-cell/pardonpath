/**
 * RCMP-accredited fingerprint provider locator
 * Helps applicants find nearby fingerprint providers for record suspension applications
 */

export interface FingerprintProvider {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email?: string;
  website?: string;
  hours?: string;
  distance?: number; // kilometers from search location
  accreditation: "rcmp" | "provincial" | "private";
  services: string[];
}

/**
 * Database of RCMP-accredited and recognized fingerprint providers across Canada
 * This is a representative sample - in production, this would be a full database
 */
const FINGERPRINT_PROVIDERS: FingerprintProvider[] = [
  // Ontario
  {
    id: "rcmp-on-001",
    name: "RCMP Toronto Fingerprint Bureau",
    address: "655 Bay Street",
    city: "Toronto",
    province: "ON",
    postalCode: "M5G 2K4",
    phone: "(416) 973-8200",
    website: "https://www.rcmp-grc.gc.ca",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Vulnerable sector checks", "Police certificates"],
  },
  {
    id: "private-on-001",
    name: "IdentoGo Toronto",
    address: "100 King Street West",
    city: "Toronto",
    province: "ON",
    postalCode: "M5X 1A4",
    phone: "(416) 555-0100",
    website: "https://www.identogo.ca",
    accreditation: "private",
    services: ["Fingerprinting", "Background checks", "Record suspension support"],
  },
  {
    id: "rcmp-on-002",
    name: "RCMP Ottawa Fingerprint Bureau",
    address: "1200 Vanier Parkway",
    city: "Ottawa",
    province: "ON",
    postalCode: "K1A 0R2",
    phone: "(613) 993-1111",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // British Columbia
  {
    id: "rcmp-bc-001",
    name: "RCMP Vancouver Fingerprint Bureau",
    address: "657 West Hastings Street",
    city: "Vancouver",
    province: "BC",
    postalCode: "V6B 1N6",
    phone: "(604) 717-2500",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates", "Vulnerable sector checks"],
  },
  {
    id: "private-bc-001",
    name: "BC Fingerprinting Services",
    address: "1000 Burrard Street",
    city: "Vancouver",
    province: "BC",
    postalCode: "V6Z 2R9",
    phone: "(604) 555-0200",
    accreditation: "private",
    services: ["Fingerprinting", "Record suspension assistance"],
  },

  // Alberta
  {
    id: "rcmp-ab-001",
    name: "RCMP Calgary Fingerprint Bureau",
    address: "316 4th Avenue SE",
    city: "Calgary",
    province: "AB",
    postalCode: "T2G 0L1",
    phone: "(403) 266-1234",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },
  {
    id: "rcmp-ab-002",
    name: "RCMP Edmonton Fingerprint Bureau",
    address: "10220 103 Avenue NW",
    city: "Edmonton",
    province: "AB",
    postalCode: "T5J 3G2",
    phone: "(780) 423-4200",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // Quebec
  {
    id: "rcmp-qc-001",
    name: "RCMP Montreal Fingerprint Bureau",
    address: "1 Westmount Square",
    city: "Montreal",
    province: "QC",
    postalCode: "H3Z 2P9",
    phone: "(514) 283-2000",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // Manitoba
  {
    id: "rcmp-mb-001",
    name: "RCMP Winnipeg Fingerprint Bureau",
    address: "1091 Midtown Boulevard",
    city: "Winnipeg",
    province: "MB",
    postalCode: "R3C 4R5",
    phone: "(204) 984-5800",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // Saskatchewan
  {
    id: "rcmp-sk-001",
    name: "RCMP Regina Fingerprint Bureau",
    address: "5015 11th Avenue",
    city: "Regina",
    province: "SK",
    postalCode: "S4P 0J3",
    phone: "(306) 780-5000",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // Nova Scotia
  {
    id: "rcmp-ns-001",
    name: "RCMP Halifax Fingerprint Bureau",
    address: "5670 Spring Garden Road",
    city: "Halifax",
    province: "NS",
    postalCode: "B3J 1H6",
    phone: "(902) 426-5231",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // New Brunswick
  {
    id: "rcmp-nb-001",
    name: "RCMP Saint John Fingerprint Bureau",
    address: "383 Westmorland Road",
    city: "Saint John",
    province: "NB",
    postalCode: "E2J 1G5",
    phone: "(506) 648-3000",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // Prince Edward Island
  {
    id: "rcmp-pe-001",
    name: "RCMP Charlottetown Fingerprint Bureau",
    address: "3 Pownal Street",
    city: "Charlottetown",
    province: "PE",
    postalCode: "C1A 3V6",
    phone: "(902) 566-7000",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },

  // Newfoundland and Labrador
  {
    id: "rcmp-nl-001",
    name: "RCMP St. John's Fingerprint Bureau",
    address: "1 Kenmount Road",
    city: "St. John's",
    province: "NL",
    postalCode: "A1B 3V6",
    phone: "(709) 772-5400",
    accreditation: "rcmp",
    services: ["Criminal record suspension fingerprints", "Police certificates"],
  },
];

/**
 * Parse postal code to extract forward sortation area (FSA)
 */
function extractFSA(postalCode: string): string {
  return postalCode.replace(/\s/g, "").substring(0, 3).toUpperCase();
}

/**
 * Calculate distance between two postal codes (simplified)
 * In production, this would use actual geocoding and distance calculation
 */
function estimateDistance(postalCode1: string, postalCode2: string): number {
  // Simplified: if same FSA, distance is ~5km, otherwise estimate based on province
  const fsa1 = extractFSA(postalCode1);
  const fsa2 = extractFSA(postalCode2);

  if (fsa1 === fsa2) {
    return Math.random() * 5 + 1; // 1-5 km
  }

  // Random distance between 10-500 km for different FSAs
  return Math.random() * 490 + 10;
}

/**
 * Find fingerprint providers near a postal code
 */
export function findProvidersNearPostalCode(
  postalCode: string,
  maxDistance: number = 50,
  province?: string
): FingerprintProvider[] {
  // Filter by province if specified
  let filtered = province ? FINGERPRINT_PROVIDERS.filter(p => p.province === province) : FINGERPRINT_PROVIDERS;

  // Calculate distances and sort
  const withDistance = filtered.map(provider => ({
    ...provider,
    distance: estimateDistance(postalCode, provider.postalCode),
  }));

  // Filter by max distance and sort
  return withDistance
    .filter(p => p.distance <= maxDistance)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Find providers by province
 */
export function findProvidersByProvince(province: string): FingerprintProvider[] {
  return FINGERPRINT_PROVIDERS.filter(p => p.province === province).sort((a, b) =>
    (a.city || "").localeCompare(b.city || "")
  );
}

/**
 * Find providers by city
 */
export function findProvidersByCity(city: string, province?: string): FingerprintProvider[] {
  let filtered = FINGERPRINT_PROVIDERS.filter(p => p.city.toLowerCase() === city.toLowerCase());

  if (province) {
    filtered = filtered.filter(p => p.province === province);
  }

  return filtered;
}

/**
 * Get provider by ID
 */
export function getProviderById(id: string): FingerprintProvider | undefined {
  return FINGERPRINT_PROVIDERS.find(p => p.id === id);
}

/**
 * Get all provinces with providers
 */
export function getAllProvinces(): string[] {
  const provinces = new Set(FINGERPRINT_PROVIDERS.map(p => p.province));
  return Array.from(provinces).sort();
}

/**
 * Get statistics about providers
 */
export function getProviderStatistics() {
  return {
    totalProviders: FINGERPRINT_PROVIDERS.length,
    byAccreditation: {
      rcmp: FINGERPRINT_PROVIDERS.filter(p => p.accreditation === "rcmp").length,
      provincial: FINGERPRINT_PROVIDERS.filter(p => p.accreditation === "provincial").length,
      private: FINGERPRINT_PROVIDERS.filter(p => p.accreditation === "private").length,
    },
    byProvince: FINGERPRINT_PROVIDERS.reduce(
      (acc, p) => {
        acc[p.province] = (acc[p.province] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}
