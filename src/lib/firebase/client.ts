import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, type User, type ConfirmationResult } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCeTY7TJeD7ZIB21SiYhoGp14rw9sVecPE',
  authDomain: 'skidsparent.firebaseapp.com',
  projectId: 'skidsparent',
  storageBucket: 'skidsparent.firebasestorage.app',
  messagingSenderId: '1057408000943',
  appId: '1:1057408000943:web:b45573bc3b9c4cb8dec55a',
  measurementId: 'G-S0MQ1HY78N',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth }

/** Sign in with Google */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  return result.user
}

/** Get current user's ID token for API calls */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

/** Sign out */
export async function signOut(): Promise<void> {
  await auth.signOut()
}

/** Send phone OTP — returns ConfirmationResult to verify later */
export async function sendPhoneOTP(phoneNumber: string, containerId: string): Promise<ConfirmationResult> {
  const recaptcha = new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  // Ensure phone has +91 prefix
  const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`
  return signInWithPhoneNumber(auth, formatted, recaptcha)
}

/** Listen to auth state changes */
export function onAuthStateChanged(callback: (user: User | null) => void) {
  return auth.onAuthStateChanged(callback)
}
