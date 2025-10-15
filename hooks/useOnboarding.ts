import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { uploadCertificates } from '../lib/cloudinary';
import { supabase } from '../lib/supabase'; 
import type { Certificate } from '../lib/cloudinary';

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

type BasicInfoStep = Pick<
  ProfileData,
  'full_name' | 'phone_number' | 'city' | 'region' | 'district' | 'country'
>;

type ProfessionalInfoStep = Pick<
  HandymanProfileData,
  'bio' | 'years_experience' | 'hourly_rate' | 'location_lat' | 'location_lng'
>;

type VerificationInfoStep = Pick<ProfileData, 'id_type' | 'id_number'> & {
  certificates?: File[] | { uri: string; name: string; type: string }[];
};

export type OnboardingData = {
  profile: Partial<ProfileData>;
  handymanProfile: Partial<HandymanProfileData>;
};

type UseOnboardingReturn = {
  isSubmitting: boolean;
  uploadProgress: number;
  onboardingData: OnboardingData;
  submitBasicInfo: (data: BasicInfoStep) => Promise<void>;
  submitProfessionalInfo: (data: ProfessionalInfoStep) => Promise<void>;
  submitVerificationInfo: (data: VerificationInfoStep) => Promise<void>;
};

export const useOnboarding = (): UseOnboardingReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      role: 'handyman',
      country: 'Ghana',
    },
    handymanProfile: {
      service_radius_km: 10,
      certified: false,
    },
  });

  const submitBasicInfo = useCallback(async (data: BasicInfoStep) => {
    try {
      setIsSubmitting(true);
      
      setOnboardingData((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...data },
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

  const submitProfessionalInfo = useCallback(async (data: ProfessionalInfoStep) => {
    try {
      setIsSubmitting(true);
      setOnboardingData((prev) => ({
        ...prev,
        handymanProfile: { ...prev.handymanProfile, ...data },
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

  const submitVerificationInfo = useCallback(
    async (data: VerificationInfoStep) => {
      try {
        setIsSubmitting(true);
        setUploadProgress(0);

        let uploadedCertificates: Certificate[] = [];
        if (data.certificates?.length) {
          Alert.alert('Uploading', 'Uploading your certificates...');
          uploadedCertificates = await uploadCertificates(
            data.certificates,
            setUploadProgress
          );
        }

        const completeProfileData: Partial<ProfileData> = {
          ...onboardingData.profile,
          id_type: data.id_type,
          id_number: data.id_number,
        };

        const completeHandymanData: Partial<HandymanProfileData> = {
          ...onboardingData.handymanProfile,
          certified: uploadedCertificates.length > 0,
          certificates: uploadedCertificates,
        };

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('No authenticated user found');
        }

        // Step 1: Upsert profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...completeProfileData,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          throw new Error(`Failed to save profile: ${profileError.message}`);
        }

        const { data: existingHandyman } = await supabase
          .from('handyman_profiles')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        let handymanData;
        if (existingHandyman) {
          const { data, error: handymanError } = await supabase
            .from('handyman_profiles')
            .update({
              ...completeHandymanData,
              certificates: uploadedCertificates,
            })
            .eq('profile_id', user.id)
            .select()
            .single();

          if (handymanError) {
            console.error('Handyman update error:', handymanError);
            throw new Error(`Failed to update handyman profile: ${handymanError.message}`);
          }
          handymanData = data;
        } else {
          const { data, error: handymanError } = await supabase
            .from('handyman_profiles')
            .insert({
              ...completeHandymanData,
              profile_id: user.id,
              certificates: uploadedCertificates,
            })
            .select()
            .single();

          if (handymanError) {
            console.error('Handyman insert error:', handymanError);
            throw new Error(`Failed to create handyman profile: ${handymanError.message}`);
          }
          handymanData = data;
        }

        console.log('Profile created/updated successfully:', { profileData, handymanData });

        Alert.alert(
          'Success',
          'Your profile has been created successfully!',
          [{ text: 'OK', onPress: () => console.log('Navigate to home') }]
        );
      } catch (error) {
        console.error('Error completing onboarding:', error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.'
        );
        throw error;
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [onboardingData]
  );

  return {
    isSubmitting,
    uploadProgress,
    onboardingData,
    submitBasicInfo,
    submitProfessionalInfo,
    submitVerificationInfo,
  };
};