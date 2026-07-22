import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  toolId: { type: String, required: true },
  toolTitle: { type: String, required: true },
  toolImage: { type: String },
  toolCategory: { type: String },
  renterId: { type: String, required: true },
  renterName: { type: String, required: true },
  renterAvatar: { type: String },
  renterRating: { type: Number, default: 5.0 },
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  rentalType: { type: String, enum: ['daily', 'hourly'], default: 'daily' },
  days: { type: Number, required: true },
  hours: { type: Number },
  dailyRate: { type: Number, required: true },
  totalEstimate: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Declined', 'Completed'], 
    default: 'Pending' 
  },
  message: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
