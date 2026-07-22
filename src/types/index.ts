export type ToolCategory = 
  | '3D Printing & Fabrication'
  | 'Power Tools & Carpentry'
  | 'Gardening & Outdoor'
  | 'Home Improvement'
  | 'Photography & Video'
  | 'Other';

export interface Owner {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  responseRate: string;
  verified: boolean;
  memberSince: string;
  city: string;
  bio: string;
}

export interface ToolReview {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ToolListing {
  id: string;
  title: string;
  category: ToolCategory;
  shortDescription: string;
  description: string;
  specs: string[];
  image: string;
  images?: string[];
  dailyRate: number;
  hourlyRate?: number;
  deposit?: number;
  location: string; // e.g. "Mumbai"
  ownerId: string;
  owner?: Owner;
  status: 'active' | 'inactive';
  rating: number;
  reviewCount: number;
  reviews?: ToolReview[];
  featured?: boolean;
  usageLocationType?: 'off-site' | 'on-site' | 'both';
}

export type BookingStatus = 'Pending' | 'Approved' | 'Declined' | 'Completed';

export interface Booking {
  id: string;
  toolId: string;
  toolTitle: string;
  toolImage: string;
  toolCategory: ToolCategory;
  renterId: string;
  renterName: string;
  renterAvatar: string;
  renterRating: number;
  ownerId: string;
  ownerName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  rentalType?: 'daily' | 'hourly';
  days: number;
  hours?: number;
  dailyRate: number;
  totalEstimate: number;
  status: BookingStatus;
  message?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  memberSince: string;
  assetCash?: number;
  assetCashLedger?: { amount: number, expiresAt: string }[];
}

export interface FilterState {
  searchQuery: string;
  category: string;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'distance';
  locations: string[];
}
