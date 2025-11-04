import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Video from '../models/Video.js';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/react-youtube';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Read videos from JSON file
    const videosFilePath = join(__dirname, '../../data/videos.json');
    const videosData = JSON.parse(readFileSync(videosFilePath, 'utf-8'));

    // Clear existing videos
    await Video.deleteMany({});
    console.log('🗑️  Cleared existing videos');

    // Transform data to match schema (rename videoUrl to url)
    const transformedVideos = videosData.map(video => ({
      ...video,
      url: video.videoUrl,
    }));

    // Insert videos
    const videos = await Video.insertMany(transformedVideos);
    console.log(`✅ Seeded ${videos.length} videos to MongoDB`);

    // Display seeded videos
    videos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.id} - ${video.title}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

