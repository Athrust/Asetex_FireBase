import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Listing from './models/Listing.js';
import Booking from './models/Booking.js';
import { OAuth2Client } from 'google-auth-library';

const __filename = (typeof import.meta !== 'undefined' && import.meta.url) 
  ? fileURLToPath(import.meta.url) 
  : (typeof __filename !== 'undefined' ? __filename : '');
const __dirname = __filename 
  ? path.dirname(__filename) 
  : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());
dotenv.config({ path: path.join(__dirname, '.env') });
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'assetex_secure_jwt_secret_key_2026';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assetex';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Netlify rewrites removed (Firebase natively maps /api)

const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) { /* ignore read-only serverless filesystem /var/task error */ }
app.use('/api/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(uploadsDir));

let useMongoDB = false;
let cachedDb = null;

function recalculateAssetCash(user) {
  if (!user.assetCashLedger) {
    user.assetCashLedger = [];
  }
  const now = new Date();
  
  // Clean up expired ledger entries
  user.assetCashLedger = user.assetCashLedger.filter(entry => {
    return new Date(entry.expiresAt) > now;
  });
  
  // If user has a legacy balance but no active ledger entries, convert it
  if (user.assetCash > 0 && user.assetCashLedger.length === 0) {
    const legacyExpiry = new Date();
    legacyExpiry.setDate(legacyExpiry.getDate() + 30);
    user.assetCashLedger.push({
      amount: user.assetCash,
      expiresAt: legacyExpiry
    });
  }

  // Recalculate total
  user.assetCash = user.assetCashLedger.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  return user;
}

async function ensureMongoConnection() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    useMongoDB = true;
    return cachedDb;
  }
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assetex';
  if (!uri) {
    useMongoDB = false;
    return null;
  }
  try {
    cachedDb = await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      autoIndex: false
    });
    useMongoDB = true;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      for (const key of Object.keys(initialOwners)) {
        await User.create(initialOwners[key]);
      }
    }
    return cachedDb;
  } catch (err) {
    console.warn(`[WARNING] MongoDB not reachable (${err.message}).`);
    useMongoDB = false;
    return null;
  }
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await ensureMongoConnection();
  }
  next();
});

// Initial seed data for fallback OR seeding MongoDB
const initialOwners = {};

const initialCurrentUser = null;

const initialListings = [];

const initialBookings = [];

// Initial trigger for standalone server runs
ensureMongoConnection().catch(() => {});

// Helper functions for reading and writing local state (fallback when MongoDB is down)
function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  
  const defaultDb = {
    owners: initialOwners,
    currentUser: initialCurrentUser,
    listings: initialListings,
    bookings: initialBookings
  };
  writeDb(defaultDb);
  return defaultDb;
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// REST Routes

// Image Upload Endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 data URL' });
    }
    const ext = matches[1].split('/')[1] || 'png';
    const safeName = `img-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    try {
      if (!process.env.NETLIFY && !process.env.LAMBDA_TASK_ROOT) {
        const buffer = Buffer.from(matches[2], 'base64');
        const filePath = path.join(uploadsDir, safeName);
        fs.writeFileSync(filePath, buffer);
      }
    } catch (e) { /* ignore filesystem write error in serverless */ }
    return res.status(201).json({ url: dataUrl, success: true });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 1. Auth / User endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (useMongoDB) {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
      }
      // Verify password against bcrypt hash
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      recalculateAssetCash(user);
      await user.save();
      const userObj = user.toObject();
      delete userObj.password;
      return res.json({ ...userObj, token });
    } catch (err) {
      console.error('MongoDB login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Fallback — JSON db
  const db = readDb();
  const allUsers = [db.currentUser, ...Object.values(db.owners)];
  const user = allUsers.find(u => u && u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  let userObj = { ...user };
  userObj = recalculateAssetCash(userObj);
  delete userObj.password;
  db.currentUser = userObj;
  writeDb(db);
  return res.json({ ...userObj, token });
});

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });
  
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    if (useMongoDB) {
      let user = await User.findOne({ email });
      if (!user) {
        // Sign-up
        user = await User.create({
          id: `user-${Date.now()}`,
          name,
          email,
          avatar: picture || '/images/default-avatar.png',
          city: 'Austin, TX — South Congress',
          verified: true
        });
      }
      
      const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      recalculateAssetCash(user);
      await user.save();
      const userObj = user.toObject();
      delete userObj.password;
      return res.json({ ...userObj, token: jwtToken });
    }
    
    // Fallback — JSON db
    const db = readDb();
    const allUsers = [db.currentUser, ...Object.values(db.owners)];
    let user = allUsers.find(u => u && u.email === email);
    
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: picture || '/images/default-avatar.png',
        city: 'Austin, TX — South Congress',
        verified: true,
        rating: 5.0,
        reviewsCount: 0,
        assetCash: 0
      };
      db.owners[user.id] = user;
    }
    
    const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    let userObj = { ...user };
    userObj = recalculateAssetCash(userObj);
    delete userObj.password;
    db.currentUser = userObj;
    writeDb(db);
    return res.json({ ...userObj, token: jwtToken });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(401).json({ error: 'Invalid Google token' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, phone, city, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  if (useMongoDB) {
    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
      }
      const user = await User.create({
        id: `user-${Date.now()}`,
        name,
        email,
        phone: phone || '',
        city: city || 'Austin, TX — South Congress',
        bio: `New member of Assetex based in ${city || 'Austin, TX'}.`,
        rating: 5.0,
        reviewsCount: 0,
        verified: true,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        password
      });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const userRes = user.toObject();
      delete userRes.password;
      return res.status(201).json({ ...userRes, token });
    } catch (err) {
      console.error('MongoDB signup error:', err);
      return res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
  }

  // Fallback — JSON db
  const db = readDb();
  const allUsers = [db.currentUser, ...Object.values(db.owners)];
  const existing = allUsers.find(u => u && u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
  }
  
  const id = `user-${Date.now()}`;
  const user = {
    id,
    name,
    email,
    phone: phone || '',
    city: city || 'Austin, TX — South Congress',
    bio: `New member of Assetex based in ${city || 'Austin, TX'}.`,
    rating: 5.0,
    reviewsCount: 0,
    verified: true,
    memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    password,
    avatar: '/images/default-avatar.png',
    assetCash: 0
  };
  
  db.owners[id] = user;
  
  const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
  const userRes = { ...user };
  delete userRes.password;
  db.currentUser = userRes;
  writeDb(db);
  return res.status(201).json({ ...userRes, token });
});

app.get('/api/auth/profile', async (req, res) => {
  if (useMongoDB) {
    try {
      let user = await User.findOne({ id: initialCurrentUser.id });
      if (!user) user = initialCurrentUser;
      if (user instanceof mongoose.Document) {
        recalculateAssetCash(user);
        await user.save();
      }
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching profile' });
    }
  }
  const db = readDb();
  if (db.currentUser) {
    db.currentUser = recalculateAssetCash(db.currentUser);
    writeDb(db);
  }
  res.json(db.currentUser);
});

app.put('/api/auth/profile', async (req, res) => {
  if (useMongoDB) {
    try {
      const id = req.body.id || initialCurrentUser.id;
      const updatedUser = await User.findOneAndUpdate({ id }, req.body, { new: true, upsert: true });
      return res.json(updatedUser);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  const db = readDb();
  if (!db.currentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  db.currentUser = { ...db.currentUser, ...req.body };
  if (db.owners[db.currentUser.id]) {
    db.owners[db.currentUser.id] = { ...db.owners[db.currentUser.id], ...req.body };
  }
  writeDb(db);
  res.json(db.currentUser);
});

// 2. Listings endpoints
app.get('/api/listings', async (req, res) => {
  if (useMongoDB) {
    try {
      const listings = await Listing.find().sort({ createdAt: -1 });
      return res.json(listings);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }
  const db = readDb();
  res.json(db.listings);
});

app.post('/api/listings', async (req, res) => {
  const newId = `tool-${Date.now()}`;
  let ownerId = req.body.ownerId || initialCurrentUser.id;

  if (useMongoDB) {
    try {
      let ownerUser = await User.findOne({ id: ownerId });
      if (!ownerUser) ownerUser = initialCurrentUser;

      const ownerObj = req.body.owner || {
        id: ownerUser.id,
        name: ownerUser.name,
        avatar: ownerUser.avatar,
        rating: ownerUser.rating || 5.0,
        reviewsCount: ownerUser.reviewsCount || 0,
        responseTime: 'Usually responds within 1 hour',
        responseRate: '100%',
        verified: ownerUser.verified,
        memberSince: ownerUser.memberSince,
        city: ownerUser.city,
        bio: ownerUser.bio
      };

      const newListing = await Listing.create({
        ...req.body,
        id: newId,
        ownerId,
        owner: ownerObj,
        status: 'active',
        rating: 5.0,
        reviewCount: 0,
        reviews: []
      });
      return res.status(201).json(newListing);
    } catch (err) {
      console.error('Create listing MongoDB error:', err);
      return res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  const db = readDb();
  if (!db.currentUser && !req.body.ownerId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  ownerId = req.body.ownerId || (db.currentUser ? db.currentUser.id : initialCurrentUser.id);
  const owner = req.body.owner || db.owners[ownerId] || (db.currentUser && db.owners[db.currentUser.id] ? db.owners[db.currentUser.id] : {
    id: ownerId,
    name: db.currentUser ? db.currentUser.name : 'Atharv Mule',
    avatar: db.currentUser ? db.currentUser.avatar : '/images/default-avatar.png',
    rating: 5.0,
    reviewsCount: 0,
    responseTime: 'Usually responds within 1 hour',
    responseRate: '100%',
    verified: true,
    memberSince: '2026',
    city: req.body.location || 'Austin, TX',
    bio: 'Neighborhood lender on Assetex.'
  });

  if (db.currentUser && ownerId === db.currentUser.id) {
    db.owners[ownerId] = owner;
  }

  const newListing = {
    ...req.body,
    id: newId,
    ownerId,
    owner,
    status: 'active',
    rating: 5.0,
    reviewCount: 0,
    reviews: []
  };

  db.listings.unshift(newListing);
  writeDb(db);
  res.status(201).json(newListing);
});

app.put('/api/listings/:id', async (req, res) => {
  const { id } = req.params;
  if (useMongoDB) {
    try {
      const updated = await Listing.findOneAndUpdate({ id }, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Listing not found' });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update listing' });
    }
  }

  const db = readDb();
  const index = db.listings.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  db.listings[index] = { ...db.listings[index], ...req.body };
  writeDb(db);
  res.json(db.listings[index]);
});

app.delete('/api/listings/:id', async (req, res) => {
  const { id } = req.params;
  if (useMongoDB) {
    try {
      await Listing.findOneAndDelete({ id });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete listing' });
    }
  }

  const db = readDb();
  db.listings = db.listings.filter(item => item.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// 3. Bookings endpoints
app.get('/api/bookings', async (req, res) => {
  if (useMongoDB) {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.json(bookings);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }
  const db = readDb();
  res.json(db.bookings);
});

app.post('/api/bookings', async (req, res) => {
  const { toolId, startDate, endDate, message } = req.body;

  if (useMongoDB) {
    try {
      let targetTool = await Listing.findOne({ id: toolId });
      if (!targetTool) {
        targetTool = {
          id: toolId,
          title: req.body.toolTitle || 'Equipment Rental',
          image: req.body.toolImage || '/images/1.png',
          category: req.body.toolCategory || 'General Equipment',
          dailyRate: req.body.dailyRate || 2800,
          ownerId: req.body.ownerId || 'user-alex',
          owner: { name: req.body.ownerName || 'Tool Owner' }
        };
      }

      const renterId = req.body.renterId || initialCurrentUser.id;
      let renter = await User.findOne({ id: renterId });
      const renterName = req.body.renterName || (renter ? renter.name : initialCurrentUser.name);
      const renterAvatar = req.body.renterAvatar || (renter ? renter.avatar : initialCurrentUser.avatar);
      const renterRating = req.body.renterRating || (renter ? renter.rating : 5.0);

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = req.body.days || Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const totalEstimate = req.body.totalEstimate || (days * (targetTool.dailyRate || 2800));

      const appliedAssetCash = req.body.appliedAssetCash || 0;
      const subtotal = totalEstimate + Math.round(totalEstimate * 0.10);
      const paidAmount = Math.max(0, subtotal - appliedAssetCash);
      const cashbackEarned = Math.round(paidAmount * 0.10);

      if (renter) {
        if (!renter.assetCashLedger) renter.assetCashLedger = [];
        
        // 1. Deduct spent Asset Cash from oldest expiring entries
        let amountToDeduct = appliedAssetCash;
        if (amountToDeduct > 0) {
          renter.assetCashLedger.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
          for (let entry of renter.assetCashLedger) {
            if (amountToDeduct <= 0) break;
            if (entry.amount > 0) {
              const deducted = Math.min(entry.amount, amountToDeduct);
              entry.amount -= deducted;
              amountToDeduct -= deducted;
            }
          }
        }
        
        // 2. Add newly earned Asset Cash
        if (cashbackEarned > 0) {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          renter.assetCashLedger.push({
            amount: cashbackEarned,
            expiresAt: expiry
          });
        }
        
        recalculateAssetCash(renter);
        await renter.save();
      }

      const newBooking = await Booking.create({
        id: `book-${Date.now()}`,
        toolId: targetTool.id,
        toolTitle: targetTool.title,
        toolImage: targetTool.image,
        toolCategory: targetTool.category,
        renterId,
        renterName,
        renterAvatar,
        renterRating,
        ownerId: req.body.ownerId || targetTool.ownerId,
        ownerName: req.body.ownerName || targetTool.owner?.name || 'Tool Owner',
        startDate,
        endDate,
        days,
        dailyRate: targetTool.dailyRate,
        totalEstimate,
        status: 'Pending',
        message,
        createdAt: new Date().toISOString().split('T')[0]
      });
      return res.status(201).json({
        ...newBooking.toObject(),
        updatedUser: renter ? renter.toObject() : undefined
      });
    } catch (err) {
      console.error('Create booking MongoDB error:', err);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  const db = readDb();
  let targetTool = db.listings.find(t => t.id === toolId);
  if (!targetTool) {
    targetTool = {
      id: toolId,
      title: req.body.toolTitle || 'Equipment Rental',
      image: req.body.toolImage || '/images/1.png',
      category: req.body.toolCategory || 'General Equipment',
      dailyRate: req.body.dailyRate || 2800,
      ownerId: req.body.ownerId || (db.currentUser ? db.currentUser.id : 'user-alex'),
      owner: { name: req.body.ownerName || 'Tool Owner' }
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = req.body.days || Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalEstimate = req.body.totalEstimate || (days * (targetTool.dailyRate || 2800));

  const renterId = req.body.renterId || (db.currentUser ? db.currentUser.id : 'user-alex');
  const renterName = req.body.renterName || (db.currentUser ? db.currentUser.name : 'Ayush');
  const renterAvatar = req.body.renterAvatar || (db.currentUser ? db.currentUser.avatar : '/images/default-avatar.png');
  const renterRating = req.body.renterRating || 5.0;

  const appliedAssetCash = req.body.appliedAssetCash || 0;
  const subtotal = totalEstimate + Math.round(totalEstimate * 0.10);
  const paidAmount = Math.max(0, subtotal - appliedAssetCash);
  const cashbackEarned = Math.round(paidAmount * 0.10);
  
  let updatedUser = undefined;
  if (db.currentUser && db.currentUser.id === renterId) {
    if (!db.currentUser.assetCashLedger) db.currentUser.assetCashLedger = [];
    
    // Deduct
    let amountToDeduct = appliedAssetCash;
    if (amountToDeduct > 0) {
      db.currentUser.assetCashLedger.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
      for (let entry of db.currentUser.assetCashLedger) {
        if (amountToDeduct <= 0) break;
        if (entry.amount > 0) {
          const deducted = Math.min(entry.amount, amountToDeduct);
          entry.amount -= deducted;
          amountToDeduct -= deducted;
        }
      }
    }
    
    // Earn
    if (cashbackEarned > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      db.currentUser.assetCashLedger.push({
        amount: cashbackEarned,
        expiresAt: expiry
      });
    }
    
    db.currentUser = recalculateAssetCash(db.currentUser);
    updatedUser = db.currentUser;
  }
  if (db.owners[renterId]) {
    if (!db.owners[renterId].assetCashLedger) db.owners[renterId].assetCashLedger = [];
    
    let amountToDeduct = appliedAssetCash;
    if (amountToDeduct > 0) {
      db.owners[renterId].assetCashLedger.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
      for (let entry of db.owners[renterId].assetCashLedger) {
        if (amountToDeduct <= 0) break;
        if (entry.amount > 0) {
          const deducted = Math.min(entry.amount, amountToDeduct);
          entry.amount -= deducted;
          amountToDeduct -= deducted;
        }
      }
    }
    
    if (cashbackEarned > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      db.owners[renterId].assetCashLedger.push({
        amount: cashbackEarned,
        expiresAt: expiry
      });
    }
    
    db.owners[renterId] = recalculateAssetCash(db.owners[renterId]);
    if (!updatedUser) updatedUser = db.owners[renterId];
  }

  const newBooking = {
    id: `book-${Date.now()}`,
    toolId: targetTool.id,
    toolTitle: targetTool.title,
    toolImage: targetTool.image,
    toolCategory: targetTool.category,
    renterId,
    renterName,
    renterAvatar,
    renterRating,
    ownerId: req.body.ownerId || targetTool.ownerId,
    ownerName: req.body.ownerName || targetTool.owner?.name || 'Tool Owner',
    startDate,
    endDate,
    days,
    dailyRate: targetTool.dailyRate,
    totalEstimate,
    status: 'Pending',
    message,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.bookings.unshift(newBooking);
  writeDb(db);
  res.status(201).json({
    ...newBooking,
    updatedUser
  });
});

app.put('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (useMongoDB) {
    try {
      const updated = await Booking.findOneAndUpdate({ id }, { status }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Booking not found' });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update booking status' });
    }
  }

  const db = readDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  db.bookings[index].status = status;
  writeDb(db);
  res.json(db.bookings[index]);
});

if (!process.env.LAMBDA_TASK_ROOT && !process.env.NETLIFY && process.env.NODE_ENV !== 'production_lambda') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Assetex Backend server running on port ${PORT} across all interfaces (0.0.0.0)`);
  });
}

export default app;
