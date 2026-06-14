// Auth service: wraps Firebase Auth (credentials) + Firestore (user profile/role).
// Every function returns { ok, ... } / { ok:false, error } so callers stay simple.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Turn Firebase error codes into messages we can show in a toast.
function friendly(err) {
  switch (err?.code) {
    case 'auth/invalid-email': return 'That email address looks invalid';
    case 'auth/email-already-in-use': return 'An account already exists with this email';
    case 'auth/weak-password': return 'Password must be at least 6 characters';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email or password is wrong';
    case 'auth/too-many-requests': return 'Too many attempts — try again later';
    case 'auth/network-request-failed': return 'Network error — check your connection';
    default: return err?.message || 'Something went wrong, please try again';
  }
}

// Read the /users/{uid} profile doc (role, name, etc.).
export async function fetchProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// Create account + write profile. `profile` must include role and the display fields.
export async function signUp(email, password, profile) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const data = { ...profile, email, createdAt: serverTimestamp() };
    await setDoc(doc(db, 'users', cred.user.uid), data);
    return { ok: true, uid: cred.user.uid, profile: data };
  } catch (err) {
    return { ok: false, error: friendly(err) };
  }
}

export async function signIn(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchProfile(cred.user.uid);
    return { ok: true, uid: cred.user.uid, profile };
  } catch (err) {
    return { ok: false, error: friendly(err) };
  }
}

export async function signOutUser() {
  await signOut(auth);
}

// Subscribe to auth changes. cb(user|null) fires on login, logout and page load.
export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}
