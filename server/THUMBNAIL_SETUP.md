# Thumbnail Generation Setup

## Automatic Thumbnail from Video First Frame

To enable automatic thumbnail generation from video first frames, you need to install FFmpeg on your server.

### Installation

#### Windows
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH
4. Verify: `ffmpeg -version`

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Enable in Code

Once FFmpeg is installed, uncomment the code in `server/src/routes/uploadRoutes.js` (around line 64):

```javascript
// Current (placeholder):
thumbnailUrl = 'https://images.unsplash.com/photo-...';

// Uncomment this:
try {
  const { generateThumbnailFromVideo } = await import('../utils/videoUtils.js');
  thumbnailUrl = await generateThumbnailFromVideo(videoUrl, `user-${Date.now()}`);
  console.log('📷 Generated thumbnail from video first frame');
} catch (error) {
  console.error('Failed to generate thumbnail:', error);
  // Fall back to placeholder
}
```

### How It Works

1. User uploads video without custom thumbnail
2. Video is uploaded to S3
3. FFmpeg extracts frame at 00:00:01
4. Frame is saved as JPG (1280x720)
5. Thumbnail is uploaded to S3
6. Thumbnail URL is saved to database
7. Temp files are cleaned up

### Manual Thumbnail Upload

Users can always upload custom thumbnails:
- Supported formats: JPG, PNG, GIF, WebP
- Max size: 10MB
- Recommended resolution: 1280x720 (16:9)
- Custom thumbnails override auto-generation

### Current Behavior (Without FFmpeg)

If FFmpeg is not installed:
- Custom thumbnails work normally
- Videos without custom thumbnails use a professional placeholder from Unsplash
- All thumbnail features work except auto-extraction

### Testing

To test thumbnail generation:
1. Install FFmpeg
2. Uncomment the code
3. Restart server
4. Upload a video without thumbnail
5. Check logs for "📷 Generated thumbnail from video first frame"
6. Verify thumbnail displays on video page

### Troubleshooting

**Error: "ffmpeg: command not found"**
- FFmpeg is not installed or not in PATH
- Install FFmpeg and restart terminal

**Error: "Cannot read properties of undefined"**
- FFmpeg binary path not configured
- Set `ffmpeg.setFfmpegPath('/path/to/ffmpeg')` if needed

**Slow thumbnail generation**
- Large video files take time to download/process
- Consider adding a background job queue (Bull/Bee)
- Or extract thumbnail on client-side before upload

