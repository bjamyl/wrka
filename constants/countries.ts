/**
 * Country-specific configurations for Ghana and Nigeria
 * This is the single source of truth for all country-dependent values
 */

export type CountryCode = "GH" | "NG";

export type MomoProvider = {
  id: string;
  label: string;
  color: string;
};

export type IDType = {
  label: string;
  value: string;
};

export type CountryConfig = {
  code: CountryCode;
  name: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  phone: {
    countryCode: string;
    placeholder: string;
    exampleFormat: string;
  };
  momoProviders: MomoProvider[];
  idTypes: IDType[];
  location: {
    cityPlaceholder: string;
    regionPlaceholder: string;
    districtPlaceholder: string;
  };
};

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  GH: {
    code: "GH",
    name: "Ghana",
    currency: {
      code: "GHS",
      symbol: "GH₵",
      name: "Ghana Cedi",
    },
    phone: {
      countryCode: "+233",
      placeholder: "024 XXX XXXX",
      exampleFormat: "+233 24 123 4567",
    },
    momoProviders: [
      { id: "mtn", label: "MTN MoMo", color: "#FFC107" },
      { id: "vodafone", label: "Vodafone Cash", color: "#E60000" },
      { id: "airteltigo", label: "AirtelTigo Money", color: "#E53935" },
    ],
    idTypes: [
      { label: "Ghana Card (National ID)", value: "ghana_card" },
      { label: "Voter's ID", value: "voters_id" },
      { label: "Passport", value: "passport" },
      { label: "Driver's License", value: "drivers_license" },
      { label: "SSNIT Card", value: "ssnit_card" },
    ],
    location: {
      cityPlaceholder: "e.g. Kumasi",
      regionPlaceholder: "e.g. Ashanti",
      districtPlaceholder: "e.g. Kumasi Metro",
    },
  },
  NG: {
    code: "NG",
    name: "Nigeria",
    currency: {
      code: "NGN",
      symbol: "₦",
      name: "Nigerian Naira",
    },
    phone: {
      countryCode: "+234",
      placeholder: "0803 XXX XXXX",
      exampleFormat: "+234 803 123 4567",
    },
    momoProviders: [
      { id: "mtn", label: "MTN MoMo", color: "#FFC107" },
      { id: "airtel", label: "Airtel Money", color: "#E53935" },
      { id: "glo", label: "Glo Mobile Money", color: "#50B651" },
      { id: "9mobile", label: "9mobile", color: "#006B53" },
    ],
    idTypes: [
      { label: "National ID (NIN)", value: "nin" },
      { label: "Voter's Card", value: "voters_card" },
      { label: "Passport", value: "passport" },
      { label: "Driver's License", value: "drivers_license" },
      { label: "BVN Slip", value: "bvn" },
    ],
    location: {
      cityPlaceholder: "e.g. Lagos",
      regionPlaceholder: "e.g. Lagos State",
      districtPlaceholder: "e.g. Ikeja",
    },
  },
};

// Default country (can be changed based on app settings)
export const DEFAULT_COUNTRY: CountryCode = "GH";

// Helper to get country config
export function getCountryConfig(code: CountryCode): CountryConfig {
  return COUNTRIES[code];
}

// Get all country options for dropdowns
export function getCountryOptions() {
  return Object.values(COUNTRIES).map((c) => ({
    label: c.name,
    value: c.code,
  }));
}

// Format currency amount with symbol
export function formatCurrency(amount: number, countryCode: CountryCode): string {
  const config = COUNTRIES[countryCode];
  return `${config.currency.code} ${amount.toFixed(2)}`;
}

// Format currency with symbol only (for compact displays)
export function formatCurrencyShort(amount: number, countryCode: CountryCode): string {
  const config = COUNTRIES[countryCode];
  return `${config.currency.symbol}${amount.toFixed(2)}`;
}

// Get all valid momo provider IDs for a country
export function getMomoProviderIds(countryCode: CountryCode): string[] {
  return COUNTRIES[countryCode].momoProviders.map((p) => p.id);
}

// Get all valid momo provider IDs across all countries (for database constraints)
export function getAllMomoProviderIds(): string[] {
  const allIds = new Set<string>();
  Object.values(COUNTRIES).forEach((country) => {
    country.momoProviders.forEach((p) => allIds.add(p.id));
  });
  return Array.from(allIds);
}
