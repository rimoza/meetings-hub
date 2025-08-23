# Firebase Setup Guide

This application uses Firebase for authentication and data storage. Follow these steps to set up Firebase for your project.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "meetings-hub")
4. Disable Google Analytics (optional) or configure it
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click "Google" provider
5. Toggle "Enable"
6. Add your project support email
7. Click "Save"

## Step 3: Set Up Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select your preferred location
5. Click "Done"

## Step 4: Get Your Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Enter an app nickname (e.g., "meetings-hub-web")
6. Click "Register app"
7. Copy the firebaseConfig object

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

## Step 6: Configure Authorized Domains

1. In Firebase Console, go to "Authentication" → "Settings" → "Authorized domains"
2. Add your domains:
   - For development: `localhost` (required for local development)
   - For production: your actual domain

**Important**: If you cannot add `localhost` to authorized domains, you can:

- Use the Firebase Hosting URL for development (e.g., `meetings-hub-prod.web.app`)
- Or contact your Firebase project administrator to add `localhost`

## Step 7: Set Up Firestore Security Rules

1. Go to "Firestore Database" → "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own meetings
    match /meetings/{document} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Users can access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 8: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Try signing in with Google
4. If successful, you should be redirected to the dashboard

## Troubleshooting

### CORS Errors

- Make sure `localhost` is added to authorized domains
- Ensure your Firebase config is correct in `.env.local`

### Authentication Errors

- Check that Google sign-in is enabled in Firebase Console
- Verify your API key and auth domain are correct

### Firestore Permission Errors

- Make sure security rules are set up correctly
- Check that the user is authenticated before making database calls

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment-specific Firebase projects (dev, staging, prod)
- Regularly review and update Firestore security rules
- Monitor authentication activity in Firebase Console
