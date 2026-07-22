import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String },
  rating: { type: Number, required: true },
  date: { type: String },
  comment: { type: String }
}, { _id: false });

const ownerSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  responseTime: { type: String, default: 'Usually responds within 1 hour' },
  responseRate: { type: String, default: '100%' },
  verified: { type: Boolean, default: true },
  memberSince: { type: String },
  city: { type: String },
  bio: { type: String }
}, { _id: false });

const listingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  specs: [{ type: String }],
  image: { type: String },
  images: [{ type: String }],
  dailyRate: { type: Number, required: true },
  deposit: { type: Number },
  location: { type: String, default: 'Austin, TX — South Congress' },
  ownerId: { type: String, required: true },
  owner: { type: ownerSubSchema },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
  featured: { type: Boolean, default: false },
  usageLocationType: { type: String, enum: ['off-site', 'on-site'], default: 'off-site' }
}, {
  timestamps: true
});

export const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
export default Listing;
