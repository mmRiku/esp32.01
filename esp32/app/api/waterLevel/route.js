import crypto from 'crypto';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

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

const SECURITY_KEY = "c4be4d014d5ce57aaa53d40896b4cb36744359e3c39cc2ee477dd95024766899";

export async function POST(request) {
  try {
    const { key, waterLevel } = await request.json();
    const hashedKey = crypto.createHash('sha256').update(key || "").digest('hex');
    if (hashedKey !== SECURITY_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const waterRef = ref(db, "waterLevel");
    await set(waterRef, waterLevel);
    return new Response(JSON.stringify({ waterLevel }), { status: 200 });
  } catch (error) {
    console.error("Error updating waterLevel:", error);
    return new Response(JSON.stringify({ error: "Error updating waterLevel" }), { status: 500 });
  }
}