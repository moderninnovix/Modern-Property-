import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  setDoc,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID if available
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Helper to remove undefined properties before writing to Firestore
function sanitizeData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(v => sanitizeData(v));
  } else if (data !== null && typeof data === 'object') {
    const clean: any = {};
    for (const key of Object.keys(data)) {
      if (data[key] !== undefined) {
        clean[key] = sanitizeData(data[key]);
      }
    }
    return clean;
  }
  return data;
}

/**
 * Loads a collection from Firestore. If the collection is empty,
 * it initializes Firestore with the default data.
 */
export async function loadCollection<T extends { id: string }>(
  collectionName: string,
  defaultData: T[]
): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    if (querySnapshot.empty) {
      console.log(`Collection ${collectionName} is empty in Firestore. Seeding defaults...`);
      await saveCollection(collectionName, defaultData);
      return defaultData;
    }
    
    const list: T[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as T);
    });
    return list;
  } catch (err) {
    console.error(`Error loading collection ${collectionName} from Firestore`, err);
    return defaultData;
  }
}

/**
 * Saves/updates entire collection in Firestore using batch writes.
 */
export async function saveCollection<T extends { id: string }>(
  collectionName: string,
  data: T[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const sanitized = sanitizeData(data) as T[];

    // 1. First, read what has already been stored to avoid leaving stale items 
    // or just overwrite known IDs.
    const querySnapshot = await getDocs(collection(db, collectionName));
    const existingIds = new Set<string>();
    querySnapshot.forEach((doc) => {
      existingIds.add(doc.id);
    });

    // 2. Set/Update new items
    for (const item of sanitized) {
      if (!item.id) continue;
      const ref = doc(db, collectionName, item.id);
      batch.set(ref, item, { merge: true });
      existingIds.delete(item.id);
    }

    // 3. Delete old items that are no longer present in the updated list
    for (const oldId of existingIds) {
      const ref = doc(db, collectionName, oldId);
      batch.delete(ref);
    }

    await batch.commit();
    console.log(`Successfully synced collection ${collectionName} with ${data.length} items.`);
  } catch (err) {
    console.error(`Error saving collection ${collectionName} to Firestore`, err);
  }
}

/**
 * Special helper for single configs like settings
 */
export async function loadSettings(defaultData: any): Promise<any> {
  try {
    const querySnapshot = await getDocs(collection(db, "settings"));
    if (querySnapshot.empty) {
      await saveSettings(defaultData);
      return defaultData;
    }
    let found: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.id === "global") {
        found = doc.data();
      }
    });
    return found || defaultData;
  } catch (err) {
    console.error("Error loading settings from Firestore", err);
    return defaultData;
  }
}

export async function saveSettings(data: any): Promise<void> {
  try {
    const sanitized = sanitizeData(data);
    await setDoc(doc(db, "settings", "global"), sanitized, { merge: true });
    console.log("Successfully stored settings into Firestore");
  } catch (err) {
    console.error("Error saving settings to Firestore", err);
  }
}

export { db };
