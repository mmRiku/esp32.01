import crypto from 'crypto';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBQaYmOXz6u8d8i-JUy0FVASi79G8d8yak",
  authDomain: "esp32-01-228b7.firebaseapp.com",
  databaseURL: "https://esp32-01-228b7-default-rtdb.firebaseio.com",
  projectId: "esp32-01-228b7",
  storageBucket: "esp32-01-228b7.firebasestorage.app",
  messagingSenderId: "833929362119",
  appId: "1:833929362119:web:fc3d9f426f802248355ce2",
  measurementId: "G-2QVE65LETS"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

const SECURITY_KEY = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const providedKey = searchParams.get("key") || "";
  const hashedKey = crypto.createHash('sha256').update(providedKey).digest('hex');
  if (hashedKey !== SECURITY_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const pumpRef = ref(db, "pumpState");
    const snapshot = await get(pumpRef);
    const pumpState = snapshot.exists() ? snapshot.val() : false;
    return new Response(JSON.stringify({ pumpState }), { status: 200 });
  } catch (error) {
    console.error("Error reading pumpState:", error);
    return new Response(JSON.stringify({ error: "Error reading pumpState" }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { key, pumpState } = await request.json();
    const hashedKey = crypto.createHash('sha256').update(key || "").digest('hex');
    if (hashedKey !== SECURITY_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const pumpRef = ref(db, "pumpState");
    await set(pumpRef, pumpState);
    return new Response(JSON.stringify({ pumpState }), { status: 200 });
  } catch (error) {
    console.error("Error updating pumpState:", error);
    return new Response(JSON.stringify({ error: "Error updating pumpState" }), { status: 500 });
  }
}
