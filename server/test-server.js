// Simple diagnostic script to test server components

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Testing Server Components...\n');

// Test 1: Environment Variables
console.log('1️⃣  Environment Variables:');
console.log('   PORT:', process.env.PORT || 'NOT SET');
console.log('   MONGO_URI:', process.env.MONGO_URI ? 'SET ✅' : 'NOT SET ❌');
console.log('   AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('   S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || 'NOT SET');
console.log('');

// Test 2: Import Database Config
console.log('2️⃣  Testing database import...');
try {
  const { default: connectDB } = await import('./src/config/database.js');
  console.log('   ✅ Database config imported successfully');
} catch (error) {
  console.log('   ❌ Database import failed:', error.message);
  process.exit(1);
}

// Test 3: Import AWS Config
console.log('\n3️⃣  Testing AWS config import...');
try {
  const { isS3Configured } = await import('./src/config/aws.js');
  console.log('   ✅ AWS config imported successfully');
  console.log('   S3 Configured:', isS3Configured() ? 'YES ✅' : 'NO ⚠️');
} catch (error) {
  console.log('   ❌ AWS config import failed:', error.message);
  console.log(error.stack);
  process.exit(1);
}

// Test 4: Import Video Model
console.log('\n4️⃣  Testing Video model import...');
try {
  const { default: Video } = await import('./src/models/Video.js');
  console.log('   ✅ Video model imported successfully');
} catch (error) {
  console.log('   ❌ Video model import failed:', error.message);
  process.exit(1);
}

// Test 5: Import Routes
console.log('\n5️⃣  Testing routes import...');
try {
  const { default: videoRoutes } = await import('./src/routes/videoRoutes.js');
  console.log('   ✅ Video routes imported successfully');
} catch (error) {
  console.log('   ❌ Video routes import failed:', error.message);
  process.exit(1);
}

try {
  const { default: uploadRoutes } = await import('./src/routes/uploadRoutes.js');
  console.log('   ✅ Upload routes imported successfully');
} catch (error) {
  console.log('   ❌ Upload routes import failed:', error.message);
  process.exit(1);
}

// Test 6: Start Express
console.log('\n6️⃣  Testing Express server...');
try {
  const express = await import('express');
  const app = express.default();
  app.listen(5001, () => {
    console.log('   ✅ Express server started on port 5001');
    console.log('\n✨ All tests passed! The server should work.');
    console.log('\nTry running: npm run dev');
    process.exit(0);
  });
} catch (error) {
  console.log('   ❌ Express failed:', error.message);
  process.exit(1);
}

