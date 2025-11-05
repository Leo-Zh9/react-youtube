import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Extract first frame from video URL and upload to S3 as thumbnail
 * @param {string} videoUrl - S3 URL of the video
 * @param {string} videoId - Unique ID for the video
 * @returns {Promise<string>} S3 URL of the generated thumbnail
 */
export const generateThumbnailFromVideo = async (videoUrl, videoId) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, '../../temp');
    const tempThumbnail = path.join(tempDir, `${videoId}-thumb.jpg`);

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Extract frame at 1 second
    ffmpeg(videoUrl)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: `${videoId}-thumb.jpg`,
        folder: tempDir,
        size: '1280x720',
      })
      .on('end', async () => {
        try {
          // Read the generated thumbnail
          const thumbnailBuffer = fs.readFileSync(tempThumbnail);

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
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
          };

          await s3Client.send(new PutObjectCommand(uploadParams));

          const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

          // Clean up temp file
          fs.unlinkSync(tempThumbnail);

          resolve(thumbnailUrl);
        } catch (error) {
          console.error('Error uploading thumbnail to S3:', error);
          // Clean up temp file
          if (fs.existsSync(tempThumbnail)) {
            fs.unlinkSync(tempThumbnail);
          }
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('FFmpeg error:', error);
        // Clean up temp file if it exists
        if (fs.existsSync(tempThumbnail)) {
          fs.unlinkSync(tempThumbnail);
        }
        reject(error);
      });
  });
};

