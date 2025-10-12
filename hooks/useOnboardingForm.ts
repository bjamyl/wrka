import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useOnboardingForm() {
  // --- Step 1 Data ---
  const [basicInfo, setBasicInfo] = useState({
    full_name: "",
    phone_number: "",
    avatar_url: "",
    city: "",
    region: "",
    district: "",
    country: "",
  });

  // --- Step 2 Data ---
  const [professionalInfo, setProfessionalInfo] = useState({
    bio: "",
    years_experience: "",
    hourly_rate: "",
    service_radius: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // --- Step 3 Data ---
  const [verificationInfo, setVerificationInfo] = useState({
    id_type: "",
    id_number: "",
    certificates: [] as any[],
  });

  // --- Loading & error states ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Merge all data ---
  const getAllData = () => ({
    ...basicInfo,
    ...professionalInfo,
    ...verificationInfo,
  });

  // --- Submit to Supabase ---
  const submit = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Insert into profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            user_id: userId,
            full_name: basicInfo.full_name,
            phone_number: basicInfo.phone_number,
            avatar_url: basicInfo.avatar_url,
            city: basicInfo.city,
            region: basicInfo.region,
            district: basicInfo.district,
            country: basicInfo.country,
            role: "handyman",
          },
        ])
        .select("id")
        .single();

      if (profileError) throw profileError;

      // 2. Insert into handyman_profiles
      const { error: handymanError } = await supabase
        .from("handyman_profiles")
        .insert([
          {
            profile_id: profileData.id,
            bio: professionalInfo.bio,
            years_experience: Number(professionalInfo.years_experience),
            hourly_rate: Number(professionalInfo.hourly_rate),
            service_radius: Number(professionalInfo.service_radius),
            latitude: professionalInfo.latitude,
            longitude: professionalInfo.longitude,
            certificates: verificationInfo.certificates,
            is_verified: false,
            is_certified: false,
            is_available: true,
            total_jobs: 0,
          },
        ]);

      if (handymanError) throw handymanError;

      return { success: true };
    } catch (err: any) {
      console.error("Onboarding submit error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    basicInfo,
    setBasicInfo,
    professionalInfo,
    setProfessionalInfo,
    verificationInfo,
    setVerificationInfo,
    getAllData,
    submit,
    loading,
    error,
  };
}
