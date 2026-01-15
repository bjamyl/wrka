export interface ServiceCategory {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type ServiceRequestStatus =
  | "pending"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "rejected"
  | "completed"
  | "cancelled";

export type PaymentStatus = 'unpaid' | 'pending' | 'processing' | 'paid' | 'failed';

export type ServiceRequest = {
  id: string;
  customer_id: string;
  handyman_id: string | null;
  category_id: string | null;
  title: string;
  description: string;
  service_type: string;
  photos: any[] | null
  location_address: string;
  location_lat: number;
  location_lng: number;
  status: ServiceRequestStatus;
  scheduled_time: string;
  final_cost: number | null;
  accepted_at: string | null;
  departed_at: string | null;
  estimated_cost: number | null;
  priority: "low" | "normal" | "urgent";
  created_at: string;
  started_at: string;
  completed_at: string;
  updated_at: string;
  // Payment fields
  payment_status: PaymentStatus;
  payment_request_id: string | null;
  payment_completed_at: string | null;
};

// Enriched service request with joined data
export type ServiceRequestWithDetails = ServiceRequest & {
  customer?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    phone_number?: string;
  };
  category?: ServiceCategory;
  distance_km?: number;
};

// Real-time location data for tracking
export type HandymanLocationBroadcast = {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: number;
};
