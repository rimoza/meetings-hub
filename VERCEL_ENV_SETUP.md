# Vercel Environment Variables Setup

To deploy your Firebase-enabled app to Vercel, you need to add these environment variables to your Vercel project.

## Step 1: Access Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `meetings-hub-three` project
3. Go to **Settings** → **Environment Variables**

## Step 2: Add Firebase Environment Variables

Add these environment variables (one by one):

### Variable Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
**Value:** `AIzaSyCDY5sEZnR6DWpiI0GwM83zE7Cqa-rFk_k`

### Variable Name: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`  
**Value:** `meetings-hub-prod.firebaseapp.com`

### Variable Name: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
**Value:** `meetings-hub-prod`

### Variable Name: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
**Value:** `meetings-hub-prod.appspot.com`

### Variable Name: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
**Value:** `970698372590`

### Variable Name: `NEXT_PUBLIC_FIREBASE_APP_ID`
**Value:** `1:970698372590:web:760495d6f374ef4567caff`

### Variable Name: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
**Value:** `G-RNTWHBJT7P`

## Step 3: Deploy Changes

After adding all environment variables:
1. Go to your project's **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deployment

## Step 4: Test Production Authentication

1. Visit `https://meetings-hub-three.vercel.app`
2. Try signing in with Google
3. Authentication should now work on production

## Important Notes

- All environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Make sure `meetings-hub-three.vercel.app` is added to Firebase authorized domains
- Environment variables are encrypted and secure in Vercel