import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Check if S3 is configured
export const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.S3_BUCKET_NAME
  );
};

// Lazy initialization - only create S3 client when needed
let s3Client = null;
let uploadMiddleware = null;
let uploadThumbnailMiddleware = null;
let initialized = false;

// Initialize S3 configuration
const initializeS3 = () => {
  if (initialized) return;
  
  if (!isS3Configured()) {
    console.log('⚠️  AWS S3 not configured. File uploads will not work.');
    console.log('   Add AWS credentials to .env to enable S3 uploads:');
    console.log('   - AWS_ACCESS_KEY_ID');
    console.log('   - AWS_SECRET_ACCESS_KEY');
    console.log('   - AWS_REGION');
    console.log('   - S3_BUCKET_NAME');
    initialized = true;
    return;
  }

  try {
    // Initialize S3 Client
    s3Client = new S3Client({
      region: process.env.AWS_REGION.trim(),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
      },
    });

    // Configure Multer for video upload to S3
    uploadMiddleware = multer({
      storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME.trim(),
        // No ACL - bucket policy handles public access
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          // Generate unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `videos/${uniqueSuffix}.${fileExtension}`;
          cb(null, fileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
      }),
      limits: {
        fileSize: 200 * 1024 * 1024, // 200MB max file size
      },
      fileFilter: function (req, file, cb) {
        // Accept video files only
        if (file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only video files are allowed!'), false);
        }
      },
    });

    // Configure Multer for thumbnail upload to S3
    uploadThumbnailMiddleware = multer({
      storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME.trim(),
        // No ACL - bucket policy handles public access
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `thumbnails/${uniqueSuffix}.${fileExtension}`;
          cb(null, fileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size for thumbnails
      },
      fileFilter: function (req, file, cb) {
        // Accept image files only
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed for thumbnails!'), false);
        }
      },
    });

    console.log('✅ AWS S3 configured successfully');
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log('📋 Using ACL-free uploads (bucket policy handles access)');
    
    initialized = true;
  } catch (error) {
    console.error('❌ Error initializing AWS S3:', error.message);
  }
};

// Getter functions that ensure initialization
export const getS3Client = () => {
  if (!initialized) initializeS3();
  return s3Client;
};

export const getUploadMiddleware = () => {
  if (!initialized) initializeS3();
  return uploadMiddleware;
};

export const getUploadThumbnailMiddleware = () => {
  if (!initialized) initializeS3();
  return uploadThumbnailMiddleware;
};

// Export initialization function
export { initializeS3 };
