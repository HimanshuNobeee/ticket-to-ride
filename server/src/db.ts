import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let db: any = null;
const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log("✅ Firebase Firestore initialized using service account environment variable.");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", err);
  }
} else if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log("✅ Firebase Firestore initialized using local service account file.");
  } catch (err) {
    console.error("Failed to load local service account file:", err);
  }
} else {
  console.warn("⚠️ No Firebase credentials found (neither FIREBASE_SERVICE_ACCOUNT nor firebase-service-account.json). Running in-memory fallback mode.");
}

// In-memory fallback database
const memoryDb: Record<string, any> = {};

export async function getGameFromDb(roomId: string): Promise<any | null> {
  const code = roomId.toUpperCase();
  if (db) {
    try {
      const docRef = db.collection('games').doc(code);
      const doc = await docRef.get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.error(`Error reading room ${code} from Firestore:`, err);
    }
  }
  
  // Fallback to memory
  return memoryDb[code] || null;
}

export async function saveGameToDb(roomId: string, gameState: any): Promise<void> {
  const code = roomId.toUpperCase();
  if (db) {
    try {
      const docRef = db.collection('games').doc(code);
      // Strip out the updatedAt from the stored game state itself and save it
      const { updatedAt, ...cleanState } = gameState;
      await docRef.set({
        ...cleanState,
        updatedAt: new Date().toISOString()
      });
      return;
    } catch (err) {
      console.error(`Error saving room ${code} to Firestore:`, err);
    }
  }
  
  // Fallback to memory
  memoryDb[code] = gameState;
}

export async function deleteGameFromDb(roomId: string): Promise<void> {
  const code = roomId.toUpperCase();
  if (db) {
    try {
      const docRef = db.collection('games').doc(code);
      await docRef.delete();
      return;
    } catch (err) {
      console.error(`Error deleting room ${code} from Firestore:`, err);
    }
  }
  
  // Fallback to memory
  delete memoryDb[code];
}

// Keep initDb so server.ts startup code remains unmodified
export async function initDb() {
  if (db) {
    console.log("✅ Cloud Firestore database connection active.");
  }
}
