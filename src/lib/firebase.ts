import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentProfile, SpecialtyCategory } from '../types';

// 1. Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore using the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Verification check on boot as mandated by skill guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase & Firestore connected successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Please check your network connection.');
    }
  }
}

// Helper to convert Firebase Auth user into a TeamForge StudentProfile
export function mapFirebaseUserToStudent(
  user: FirebaseUser,
  customData?: Partial<StudentProfile>
): StudentProfile {
  const displayName = user.displayName || user.email?.split('@')[0]?.replace(/[._]/g, ' ') || 'Student Member';
  // Capitalize nicely
  const formattedName = displayName.replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: user.uid,
    name: formattedName,
    email: user.email || 'student@university.edu',
    avatar: user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
    university: customData?.university || 'UC Berkeley',
    major: customData?.major || 'Computer Science',
    year: customData?.year || 'Junior',
    bio: customData?.bio || 'Passionate student builder eager to collaborate on high-impact projects.',
    specialty: customData?.specialty || ('Engineering' as SpecialtyCategory),
    skills: customData?.skills || [
      { name: 'TypeScript', level: 'Advanced', category: 'code' },
      { name: 'React', level: 'Advanced', category: 'code' },
      { name: 'System Design', level: 'Intermediate', category: 'code' },
    ],
    interests: customData?.interests || ['Hackathons', 'AI Tools', 'Startups'],
    experienceLevel: customData?.experienceLevel || 'Intermediate',
    availability: customData?.availability || 'Actively Looking',
    hoursPerWeek: customData?.hoursPerWeek || 15,
    pastProjectsCount: customData?.pastProjectsCount || 2,
    hackathonsAttended: customData?.hackathonsAttended || 3,
    badges: customData?.badges || ['Firebase Verified', 'New Member'],
  };
}

// Save or merge student profile to Firestore `/users/{uid}`
export async function syncUserProfileToFirestore(profile: StudentProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.id);
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
  }
}

// Fetch user profile from Firestore `/users/{uid}`
export async function fetchUserProfileFromFirestore(userId: string): Promise<StudentProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as StudentProfile;
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore:', err);
  }
  return null;
}

// Google Sign In via Firebase
export async function signInWithFirebaseGoogle(): Promise<{ user?: FirebaseUser; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (err: any) {
    console.warn('Firebase Google sign-in attempt error:', err);
    if (err?.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return {};
      } catch (redirectErr: any) {
        return { 
          error: 'Browser popup was blocked. Please allow popups or open the app in a new tab to complete Google sign in.' 
        };
      }
    }
    if (err?.code === 'auth/popup-closed-by-user') {
      return { error: 'Sign-in window closed before completing.' };
    }
    return { error: err?.message || 'Google sign-in failed via Firebase.' };
  }
}

// Email & Password Sign In
export async function signInWithFirebaseEmail(
  email: string, 
  pass: string
): Promise<{ user?: FirebaseUser; error?: string }> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return { user: res.user };
  } catch (err: any) {
    let msg = err?.message || 'Failed to sign in with email.';
    if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
      msg = 'Invalid email or password. Please verify your credentials.';
    } else if (err?.code === 'auth/user-not-found') {
      msg = 'No account found with this email. Please register first.';
    }
    return { error: msg };
  }
}

// Register with Email & Password
export async function registerWithFirebaseEmail(
  email: string, 
  pass: string, 
  fullName: string
): Promise<{ user?: FirebaseUser; error?: string }> {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user && fullName) {
      await updateProfile(res.user, { displayName: fullName });
    }
    return { user: res.user };
  } catch (err: any) {
    let msg = err?.message || 'Failed to register with email.';
    if (err?.code === 'auth/email-already-in-use') {
      msg = 'An account with this email already exists. Try logging in instead.';
    } else if (err?.code === 'auth/weak-password') {
      msg = 'Password is too weak. Please use at least 6 characters.';
    }
    return { error: msg };
  }
}

// Sign Out
export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Error signing out from Firebase:', err);
  }
}
