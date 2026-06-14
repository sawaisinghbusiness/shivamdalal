# Firebase Auth setup (Email + Password)

The app code is already wired to Firebase. You just need to create the Firebase
project and paste its config into `.env.local`.

## 1. Create the project
1. Go to https://console.firebase.google.com/ and sign in with your Google account.
2. Click **Add project** → name it (e.g. `sarvottam`) → continue.
3. Google Analytics is optional — you can disable it. Click **Create project**.

## 2. Register a Web app & get the config
1. On the project overview, click the **Web** icon `</>`.
2. Give it a nickname (e.g. `sarvottam-web`). You do NOT need Firebase Hosting now.
3. Firebase shows a `firebaseConfig = { ... }` object. Copy those 6 values into
   `sarvottam-app/.env.local`:

   | firebaseConfig key   | .env.local variable                 |
   |----------------------|-------------------------------------|
   | apiKey               | VITE_FIREBASE_API_KEY               |
   | authDomain           | VITE_FIREBASE_AUTH_DOMAIN           |
   | projectId            | VITE_FIREBASE_PROJECT_ID            |
   | storageBucket        | VITE_FIREBASE_STORAGE_BUCKET       |
   | messagingSenderId    | VITE_FIREBASE_MESSAGING_SENDER_ID  |
   | appId                | VITE_FIREBASE_APP_ID               |

## 3. Enable Email/Password sign-in
1. Left sidebar → **Build → Authentication** → **Get started**.
2. **Sign-in method** tab → **Email/Password** → toggle **Enable** → **Save**.

## 4. Create Firestore (stores user role/profile)
1. Left sidebar → **Build → Firestore Database** → **Create database**.
2. Pick a location (e.g. `asia-south1` for India) → start in **Production mode**.
3. Go to the **Rules** tab, paste the contents of `firestore.rules`, click **Publish**.

## 5. Run it
```
cd sarvottam-app
npm run dev
```
Open http://localhost:5173, click **Create account**, register — the user appears
under Authentication → Users, and a `/users/{uid}` doc appears in Firestore.

> Note: existing demo logins (demo@sarvottam.com / 1234) no longer work — accounts
> must be created through Firebase now, and passwords must be 6+ characters.
