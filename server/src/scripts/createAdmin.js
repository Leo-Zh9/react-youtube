import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function createAdmin(email) {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      console.log('   Please register this user first, then run this script again.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`\n✅ SUCCESS! User is now an admin:\n`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Admin: ${user.isAdmin}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`\n⚠️  IMPORTANT: The user must log out and log in again for admin permissions to take effect.\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node createAdmin.js <email>');
  console.log('Example: node createAdmin.js admin@example.com');
  process.exit(1);
}

createAdmin(email);

