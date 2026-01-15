import {
  CountryCode,
  CountryConfig,
  DEFAULT_COUNTRY,
  COUNTRIES,
  formatCurrency,
  formatCurrencyShort,
} from "@/constants/countries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

const COUNTRY_STORAGE_KEY = "@wrka_country";

type CountryContextType = {
  /** Current country code */
  countryCode: CountryCode;
  /** Full country configuration */
  config: CountryConfig;
  /** Whether country has been loaded from storage */
  isLoaded: boolean;
  /** Update the selected country */
  setCountry: (code: CountryCode) => Promise<void>;
  /** Format amount with currency code (e.g., "GHS 100.00") */
  formatAmount: (amount: number) => string;
  /** Format amount with symbol only (e.g., "GH₵100.00") */
  formatAmountShort: (amount: number) => string;
};

const CountryContext = createContext<CountryContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function CountryProvider({ children }: Props) {
  const [countryCode, setCountryCode] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved country on mount
  useEffect(() => {
    async function loadCountry() {
      try {
        const saved = await AsyncStorage.getItem(COUNTRY_STORAGE_KEY);
        if (saved && (saved === "GH" || saved === "NG")) {
          setCountryCode(saved as CountryCode);
        }
      } catch (error) {
        console.error("Failed to load country preference:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadCountry();
  }, []);

  const setCountry = useCallback(async (code: CountryCode) => {
    try {
      await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, code);
      setCountryCode(code);
    } catch (error) {
      console.error("Failed to save country preference:", error);
      throw error;
    }
  }, []);

  const formatAmount = useCallback(
    (amount: number) => formatCurrency(amount, countryCode),
    [countryCode]
  );

  const formatAmountShort = useCallback(
    (amount: number) => formatCurrencyShort(amount, countryCode),
    [countryCode]
  );

  const value: CountryContextType = {
    countryCode,
    config: COUNTRIES[countryCode],
    isLoaded,
    setCountry,
    formatAmount,
    formatAmountShort,
  };

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

/**
 * Hook to access country configuration
 * @throws Error if used outside CountryProvider
 */
export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
}
