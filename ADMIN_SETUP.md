# Admin Setup Guide

## Creating an Admin User

To create an admin user account, you need to manually update a user in the MongoDB database to set the `isAdmin` flag to `true`.

### Option 1: Using MongoDB Compass (GUI)

1. **Open MongoDB Compass** and connect to your database
2. **Navigate** to your database (e.g., `react-youtube`)
3. **Click** on the `users` collection
4. **Find** the user you want to make admin
5. **Click** the pencil icon to edit
6. **Add** the field `isAdmin` with value `true`
7. **Save** the changes

### Option 2: Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use react-youtube

# Update a specific user by email
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { isAdmin: true } }
)

# Verify the update
db.users.findOne({ email: "your-admin-email@example.com" })
```

### Option 3: Using a Node.js Script

Create a script `server/src/scripts/createAdmin.js`:

```javascript
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function createAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ User ${email} is now an admin`);
    console.log(user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node createAdmin.js <email>');
  process.exit(1);
}

createAdmin(email);
```

Run it:

```bash
cd server
node src/scripts/createAdmin.js your-admin-email@example.com
```

---

## Admin Features

Once a user has `isAdmin: true`, they will have the following capabilities:

### 1. Video Management
- **Delete any video** on the platform (not just their own)
- Videos can be deleted from:
  - My Uploads page (if they own it)
  - Any video through the API (if they're admin)

### 2. Authentication
- Admin status is included in JWT token
- Token includes: `{ userId, email, isAdmin }`
- Admin status persists across sessions

---

## Backend Implementation

### Models

**User Model** (`server/src/models/User.js`):
```javascript
{
  email: String,
  passwordHash: String,
  isAdmin: Boolean, // Default: false
  createdAt: Date,
  updatedAt: Date,
}
```

### Middleware

**Admin Middleware** (`server/src/middleware/admin.js`):
- Verifies JWT token
- Checks database for admin status
- Returns 403 if user is not admin

```javascript
import { requireAdmin } from '../middleware/admin.js';

router.delete('/videos/:id', requireAdmin, async (req, res) => {
  // Only admins can access
});
```

### Authorization Logic

**Delete Video Endpoint** (`DELETE /api/videos/:id`):
- Requires authentication (`authenticateToken` middleware)
- Checks if user is:
  - **Owner** of the video, OR
  - **Admin** user
- Only allows deletion if one condition is met
- Also deletes associated likes and comments

```javascript
const isOwner = video.owner.toString() === req.user.userId.toString();
const isAdmin = req.user.isAdmin;

if (!isOwner && !isAdmin) {
  return res.status(403).json({
    message: 'You do not have permission to delete this video',
  });
}
```

---

## Frontend Implementation

### Auth Service

**isAdmin Helper** (`client/src/services/authService.js`):
```javascript
export const isAdmin = () => {
  const user = getUser();
  return user && user.isAdmin === true;
};
```

### Delete Video

**API Function** (`client/src/services/api.js`):
```javascript
export const deleteVideo = async (id) => {
  const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(), // Includes JWT token
    },
  });
  return await handleResponse(response);
};
```

### UI Components

**Uploads Page** (`client/src/pages/UploadsPage.jsx`):
- Shows delete button next to every video
- All authenticated users can delete their own videos
- Admins can delete any video on the platform
- Delete button styled to match black/white aesthetic

```javascript
<button
  onClick={() => handleDeleteVideo(video.id, video.title)}
  className="bg-gray-900 hover:bg-gray-800 text-gray-500 hover:text-white..."
>
  <svg><!-- Trash icon --></svg>
</button>
```

---

## Security Considerations

1. **Token-based Auth**
   - Admin status is embedded in JWT token
   - Verified on every request

2. **Database Verification**
   - `requireAdmin` middleware double-checks database
   - Prevents token manipulation

3. **Logging**
   - All admin actions are logged
   - Format: `🗑️ Video deleted: [title] by [email] (Admin)`

4. **Cascade Deletion**
   - Deleting a video also removes:
     - All likes
     - All comments
     - Associated data

---

## Testing Admin Functionality

1. **Create an admin user** using one of the methods above
2. **Login** with admin credentials
3. **Navigate** to `/uploads` page
4. **Try to delete** a video you don't own
5. **Verify** the video is deleted and removed from the database

---

## Troubleshooting

### Admin status not working

1. **Check JWT token**:
   ```javascript
   // In browser console
   const token = localStorage.getItem('auth_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log(payload); // Should show isAdmin: true
   ```

2. **Check database**:
   ```bash
   mongosh
   use react-youtube
   db.users.findOne({ email: "your-email@example.com" })
   ```

3. **Re-login**: Admin status is set when generating JWT token, so you must login again after setting `isAdmin: true` in the database.

---

## API Endpoints Summary

| Method | Endpoint | Auth Required | Admin Required | Description |
|--------|----------|---------------|----------------|-------------|
| DELETE | `/api/videos/:id` | ✅ Yes | ⚠️ Owner or Admin | Delete a video |
| POST | `/api/auth/register` | ❌ No | ❌ No | Register (isAdmin: false) |
| POST | `/api/auth/login` | ❌ No | ❌ No | Login (returns isAdmin flag) |

---

## Future Enhancements

Potential admin features to add:

1. **Admin Dashboard**
   - View all users
   - View all videos
   - Site-wide statistics

2. **User Management**
   - Ban/suspend users
   - View user activity
   - Grant/revoke admin status

3. **Content Moderation**
   - Review reported videos
   - Bulk actions
   - Content filters

4. **Analytics**
   - Platform metrics
   - User engagement
   - Content trends

