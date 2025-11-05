import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Download file from URL to local path
 */
const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {}); // Clean up on error
      reject(error);
    });
  });
};

/**
 * Extract first frame from video URL and upload to S3 as thumbnail
 * @param {string} videoUrl - S3 URL of the video
 * @param {string} videoId - Unique ID for the video
 * @returns {Promise<string>} S3 URL of the generated thumbnail
 */
export const generateThumbnailFromVideo = async (videoUrl, videoId) => {
  const tempDir = path.join(__dirname, '../../temp');
  const tempVideo = path.join(tempDir, `${videoId}-temp.mp4`);
  const tempThumbnail = path.join(tempDir, `${videoId}-thumb.jpg`);

  try {
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    console.log(`📥 Downloading video from S3...`);
    // Download video from S3 first
    await downloadFile(videoUrl, tempVideo);
    console.log(`✅ Video downloaded, extracting frame...`);

    // Extract frame from local video file
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideo)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: `${videoId}-thumb.jpg`,
          folder: tempDir,
          size: '1280x720',
        })
        .on('end', () => {
          console.log(`✅ Frame extracted successfully`);
          resolve();
        })
        .on('error', (error) => {
          console.error('FFmpeg error:', error.message);
          reject(error);
        });
    });

    // Read the generated thumbnail
    const thumbnailBuffer = fs.readFileSync(tempThumbnail);
    console.log(`📤 Uploading thumbnail to S3...`);

    // Upload to S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const key = `thumbnails/${videoId}-auto-thumb.jpg`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const thumbnailUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`✅ Thumbnail uploaded: ${key}`);

    // Clean up temp files
    fs.unlinkSync(tempVideo);
    fs.unlinkSync(tempThumbnail);

    return thumbnailUrl;
  } catch (error) {
    // Clean up temp files on error
    if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
    if (fs.existsSync(tempThumbnail)) fs.unlinkSync(tempThumbnail);
    
    throw error;
  }
};

