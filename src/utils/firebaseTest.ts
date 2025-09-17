// Firebase connection test utility - this file helps diagnose Firebase configuration issues
import { auth, db } from '@/integrations/firebase/client';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Test Firebase Authentication connection
export const testFirebaseAuth = async () => {
  try {
    console.log('Testing Firebase Auth connection...');
    
    // Try to sign in anonymously to test the connection
    const result = await signInAnonymously(auth);
    console.log('✅ Firebase Auth is working!', result.user.uid);
    
    // Sign out immediately
    await auth.signOut();
    return { success: true, message: 'Firebase Auth is working correctly' };
  } catch (error: any) {
    console.error('❌ Firebase Auth error:', error);
    return { success: false, error: error.message };
  }
};

// Test Firestore connection
export const testFirestore = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to write a test document
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: new Date(),
      message: 'Firestore connection test'
    });
    
    console.log('✅ Firestore is working!');
    return { success: true, message: 'Firestore is working correctly' };
  } catch (error: any) {
    console.error('❌ Firestore error:', error);
    return { success: false, error: error.message };
  }
};

// Run all tests
export const runFirebaseTests = async () => {
  console.log('🔍 Running Firebase connection tests...');
  
  const authTest = await testFirebaseAuth();
  const firestoreTest = await testFirestore();
  
  return {
    auth: authTest,
    firestore: firestoreTest,
    overall: authTest.success && firestoreTest.success
  };
};

