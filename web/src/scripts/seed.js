import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env from the root of the web project
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../../.env') }); // Try root .env
dotenv.config({ path: resolve(__dirname, '../../.env') });    // Try web/.env

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase config missing. Please add your Firebase config to .env");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const NODES = [
  {
    id: "node1",
    name: "RRCE",
    location: "R.R. College of Engineering, Bangalore",
    coordinates: { lat: 12.88705, lng: 77.450153 },
    assignedUser: null,
    status: "active"
  },
  {
    id: "node2",
    name: "RRDCH",
    location: "RR Dental College & Hospital, Bangalore",
    coordinates: { lat: 12.8767, lng: 77.4475 },
    assignedUser: null,
    status: "active"
  },
  {
    id: "node3",
    name: "RRMCH",
    location: "RR Medical College & Hospital, Bangalore",
    coordinates: { lat: 12.896255, lng: 77.461852 },
    assignedUser: null,
    status: "active"
  }
];

const USERS = [
  {
    uid: "user1",
    email: "user1@empyrean.io",
    password: "user1password",
    username: "user1",
    displayName: "Chirag Mehta",
    role: "user",
    assignedNode: "node1",
  },
  {
    uid: "admin1",
    email: "admin1@empyrean.io",
    password: "admin1password",
    username: "admin1",
    displayName: "System Administrator",
    role: "admin",
    assignedNode: null,
  }
];

async function seedNodes() {
  console.log("🌱 Seeding Nodes...");
  for (const node of NODES) {
    try {
      await setDoc(doc(db, "nodes", node.id), node);
      console.log(`✅ Seeded node: ${node.id} (${node.name})`);
    } catch (error) {
      console.error(`❌ Error seeding node ${node.id}:`, error.message);
    }
  }
}

async function seedUsers() {
  console.log("\n🌱 Seeding Users...");
  for (const user of USERS) {
    let userRecord;
    try {
      // Try to create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      userRecord = userCredential.user;
      console.log(`✅ Created auth account for: ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ Auth account already exists for: ${user.email}`);
        // Login to get the uid if needed, or just rely on email for firestore lookup if we had to.
        // For simplicity, we just use the custom uid below for the firestore document.
        try {
          const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
          userRecord = userCredential.user;
        } catch (signInErr) {
           console.log(`⚠️ Could not sign in to existing account to get UID, using default config UID.`);
        }
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
        continue;
      }
    }

    // Determine the ID to use for the user document
    // If we successfully created/logged in, we can use their real Firebase Auth UID.
    // Otherwise we'll fallback to their predefined UID for local dev.
    const firestoreUid = userRecord?.uid || user.uid;

    try {
      const userDoc = {
        uid: firestoreUid,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        assignedNode: user.assignedNode,
        healthConditions: [],
        createdAt: new Date().toISOString(),
        status: "active"
      };
      await setDoc(doc(db, "users", firestoreUid), userDoc);
      console.log(`✅ Seeded Firestore profile for: ${user.email} (Role: ${user.role})`);
    } catch (error) {
      console.error(`❌ Error creating user document ${user.email}:`, error.message);
    }
  }
}

async function main() {
  console.log("🚀 Starting Empyrean Seed Script...");
  await seedNodes();
  await seedUsers();
  console.log("\n✨ Seeding Complete!");
  process.exit(0);
}

main().catch(console.error);
