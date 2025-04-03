"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
//import { getAnalytics } from "firebase/analytics";

// Firebase config and initialization
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

// Initialize Firebase outside component to prevent multiple initializations
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getDatabase(app);

export default function Dashboard() {
  const router = useRouter();
  const [toggle, setToggle] = useState(false);
  const [onTime, setOnTime] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const { expiry } = JSON.parse(auth);
      if (Date.now() > expiry) {
        localStorage.removeItem("auth");
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  // Sync pumpState with Firebase Realtime Database
  useEffect(() => {
    const pumpRef = ref(db, "pumpState");
    const unsubscribe = onValue(pumpRef, (snapshot) => {
      const value = snapshot.val();
      if (value === null) {
        // If pumpState is absent, create it with default value false
        set(ref(db, "pumpState"), false)
          .catch(error => console.error("Error setting initial pumpState:", error));
        setToggle(false);
      } else {
        setToggle(value);
      }
    }, (error) => {
      console.error("Database read error:", error);
    });
    
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  // New useEffect to track how long pump is on
  useEffect(() => {
    let timer;
    if (toggle) {
      timer = setInterval(() => {
        setOnTime(prev => prev + 1);
      }, 1000);
    } else {
      setOnTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [toggle]);

  // Modified useEffect to subscribe to waterLevel in Firebase
  useEffect(() => {
    const waterLevelRef = ref(db, "waterLevel");
    const unsubscribeWater = onValue(
      waterLevelRef,
      (snapshot) => {
        const value = snapshot.val();
        if (value === null) {
          set(waterLevelRef, 0)
            .catch(error => console.error("Error setting initial waterLevel:", error));
          setWaterLevel(0);
        } else {
          setWaterLevel(value);
        }
      },
      (error) => {
        console.error("Database read error:", error);
      }
    );
    return () => {
      unsubscribeWater && unsubscribeWater();
    };
  }, []);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return seconds.toString().padStart(2, "0") + " sec";
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0") + " sec";
    }
  };

  const handleToggle = () => {
    const newState = !toggle;
    set(ref(db, "pumpState"), newState)
      .then(() => console.log("Pump state updated successfully"))
      .catch(error => console.error("Error updating pumpState:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/");
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* New textbox for water level */}
      <div style={{ position: "absolute", top: "20px", left: "20px", background: "#333", color: "#fff", padding: "5px", borderRadius: "3px" }}>
        Waterlevel: {waterLevel}
      </div>
      <button
        className={styles.logoutButton}
        onClick={handleLogout}
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        Logout
      </button>
      <div className="centeredContainer">
        <div className={`darkBox ${toggle ? "expandedBox" : ""}`}>
          <button 
            className={`${styles.toggleButton} toggleSlide ${toggle ? "slideUp" : ""}`} 
            onClick={handleToggle}
          >
            {toggle ? "ON" : "OFF"}
          </button>
          <p className={`fadeText ${toggle ? "visible" : "invisible"}`}>
            {toggle ? `Pump is on for: ${formatTime(onTime)}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}