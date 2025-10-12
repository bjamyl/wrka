import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

// Certificate type for Cloudinary references (stored as JSONB)
export type Certificate = {
  name: string;
  url: string;
  cloudinary_public_id: string;
  uploaded_at: string;
  file_type: string;
  size: number;
};

// Types based on your database schema
export type ProfileData = {
  full_name: string;
  phone_number: string;
  city: string;
  region: string;
  district: string;
  locality?: string;
  country: string;
  id_type: string;
  id_number: string;
  avatar_url?: string;
  role: 'customer' | 'handyman';
};

export type HandymanProfileData = {
  bio: string;
  years_experience: number;
  hourly_rate: number;
  location_lat?: number;
  location_lng?: number;
  service_radius_km?: number;
  certified: boolean;
  certificates?: Certificate[]; 
};

// Partial types for each step
type BasicInfoStep = Pick<
  ProfileData,
  'full_name' | 'phone_number' | 'city' | 'region' | 'district' | 'country'
>;

type ProfessionalInfoStep = Pick<
  HandymanProfileData,
  'bio' | 'years_experience' | 'hourly_rate' | 'location_lat' | 'location_lng'
>;

type VerificationInfoStep = Pick<ProfileData, 'id_type' | 'id_number'> & {
  certificates?: HandymanProfileData['certificates'];
};

// Combined onboarding data
export type OnboardingData = {
  profile: Partial<ProfileData>;
  handymanProfile: Partial<HandymanProfileData>;
};


type UseOnboardingReturn = {
  isSubmitting: boolean;
  onboardingData: OnboardingData;
  submitBasicInfo: (data: BasicInfoStep) => Promise<void>;
  submitProfessionalInfo: (data: ProfessionalInfoStep) => Promise<void>;
  submitVerificationInfo: (data: VerificationInfoStep) => Promise<void>;
};

export const useOnboarding = (): UseOnboardingReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      role: 'handyman', // Default role, can be changed
      country: 'Ghana',
    },
    handymanProfile: {
      service_radius_km: 10,
      certified: false,
    },
  });

  // Submit basic information
  const submitBasicInfo = useCallback(async (data: BasicInfoStep) => {
    try {
      setIsSubmitting(true);
      
      // Update the profile data
      setOnboardingData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...data,
        },
      }));

      console.log('Basic info saved locally:', data);
      
    } catch (error) {
      console.error('Error saving basic info:', error);
      Alert.alert('Error', 'Failed to save basic information');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Submit professional information
  const submitProfessionalInfo = useCallback(async (data: ProfessionalInfoStep) => {
    try {
      setIsSubmitting(true);
      setOnboardingData((prev) => ({
        ...prev,
        handymanProfile: {
          ...prev.handymanProfile,
          ...data,
        },
      }));

      console.log('Professional info saved locally:', data);
      
    } catch (error) {
      console.error('Error saving professional info:', error);
      Alert.alert('Error', 'Failed to save professional information');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Submit verification information and complete onboarding
  const submitVerificationInfo = useCallback(
    async (data: VerificationInfoStep) => {
      try {
        setIsSubmitting(true);

        // Build the complete profile data
        const completeProfileData: Partial<ProfileData> = {
          ...onboardingData.profile,
          id_type: data.id_type,
          id_number: data.id_number,
        };

        // Build the complete handyman profile data
        const completeHandymanData: Partial<HandymanProfileData> = {
          ...onboardingData.handymanProfile,
          certified: data.certificates && data.certificates.length > 0,
          certificates: data.certificates || [],
        };

        console.log('Complete Profile Data:', completeProfileData);
        console.log('Complete Handyman Profile Data:', completeHandymanData);

        // TODO: Upload certificates to storage first if any
        let certificateUrls: string[] = [];
        if (data.certificates && data.certificates.length > 0) {
          // certificateUrls = await uploadCertificates(data.certificates);
          console.log('Certificates to upload:', data.certificates);
        }

        // TODO: Submit to Supabase
        // const { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .upsert(completeProfileData)
        //   .select()
        //   .single();

        // if (profileError) throw profileError;

        // const { data: handymanData, error: handymanError } = await supabase
        //   .from('handyman_profiles')
        //   .insert({
        //     ...completeHandymanData,
        //     profile_id: profileData.id,
        //     certificates: certificateUrls,
        //   })
        //   .select()
        //   .single();

        // if (handymanError) throw handymanError;

        Alert.alert(
          'Success',
          'Your profile has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // TODO: Navigate to home screen or dashboard
                console.log('Navigate to home');
              },
            },
          ]
        );
      } catch (error) {
        console.error('Error completing onboarding:', error);
        Alert.alert(
          'Error',
          'Failed to complete onboarding. Please try again.'
        );
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onboardingData]
  );





  return {
    isSubmitting,
    onboardingData,
    submitBasicInfo,
    submitProfessionalInfo,
    submitVerificationInfo,
  };
};