import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '+1 (512) 555-0100' },
  avatar: { type: String, default: 'https://ui-avatars.com/api/?name=User&background=random' },
  city: { type: String, default: 'Austin, TX — South Congress' },
  bio: { type: String, default: 'Enthusiastic DIYer and maker exploring the Assetex community.' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  responseTime: { type: String, default: 'Usually responds within 1 hour' },
  responseRate: { type: String, default: '100%' },
  verified: { type: Boolean, default: true },
  memberSince: { type: String, default: 'Jul 2026' },
  password: { type: String, select: false },
  assetCash: { type: Number, default: 0 },
  assetCashLedger: [{
    amount: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
  }]
}, {
  timestamps: true
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // Never allow passwordless login when checking password
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
