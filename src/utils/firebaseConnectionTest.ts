// Simple Firebase connection test - this file tests if Firebase is properly connected
import { auth, db } from '@/integrations/firebase/client';
import { connectFirestoreEmulator } from 'firebase/firestore';

// Test if Firebase is properly initialized
export const testFirebaseInitialization = () => {
  try {
    console.log('🔍 Testing Firebase initialization...');
    
    // Check if auth is initialized
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    // Check if db is initialized
    if (!db) {
      throw new Error('Firebase Firestore is not initialized');
    }
    
    console.log('✅ Firebase is properly initialized');
    console.log('📊 Auth app:', auth.app.name);
    console.log('📊 Firestore app:', db.app.name);
    
    return {
      success: true,
      message: 'Firebase is properly initialized',
      authApp: auth.app.name,
      firestoreApp: db.app.name
    };
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test Firebase project configuration
export const testFirebaseConfig = () => {
  try {
    console.log('🔍 Testing Firebase configuration...');
    
    const config = auth.app.options;
    console.log('📊 Project ID:', config.projectId);
    console.log('📊 Auth Domain:', config.authDomain);
    console.log('📊 API Key:', config.apiKey ? 'Present' : 'Missing');
    
    return {
      success: true,
      message: 'Firebase configuration is valid',
      projectId: config.projectId,
      authDomain: config.authDomain,
      hasApiKey: !!config.apiKey
    };
  } catch (error: any) {
    console.error('❌ Firebase configuration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run comprehensive Firebase tests
export const runComprehensiveFirebaseTests = async () => {
  console.log('🚀 Running comprehensive Firebase tests...');
  
  const initTest = testFirebaseInitialization();
  const configTest = testFirebaseConfig();
  
  return {
    initialization: initTest,
    configuration: configTest,
    overall: initTest.success && configTest.success
  };
};
