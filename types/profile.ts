export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  id_type: string;
  id_number: string;
  role: "handyman" | "client";
  city: string;
  region: string;
  district: string;
  locality: string;
  country: string;
  created_at?: string;
  last_activity_at?: string;
  updated_at?: string;
}

export interface ProfileWithAuth extends Profile {
  email?: string;
  email_verified?: boolean;
  avatar_url?: string;
}

export interface Certificate {
  url: string;
  name: string;
  size: number;
  file_type: string;
  uploaded_at: string;
}

export interface HandymanProfile {
  id: string;
  profile_id: string;
  bio: string;
  years_experience: number;
  hourly_rate: number;
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  total_jobs: number;
  location_lat: number;
  location_lng: number;
  service_radius: number;
  certificates: Certificate[];
  certified: boolean;
  created_at?: string;
  updated_at?: string;
}
