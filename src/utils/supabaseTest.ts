// Supabase connection test utility - this file helps diagnose Supabase configuration issues
import { supabase, TABLES } from '@/integrations/supabase/client';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Try to query the tasks table to test connection
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection is working!');
    return { success: true, message: 'Supabase connection is working correctly' };
  } catch (error: any) {
    console.error('❌ Supabase connection error:', error);
    return { success: false, error: error.message };
  }
};

// Test Supabase authentication
export const testSupabaseAuth = async () => {
  try {
    console.log('🔍 Testing Supabase authentication...');
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase auth error:', error);
      return { success: false, error: error.message };
    }
    
    if (!session) {
      console.log('⚠️ No active Supabase session');
      return { success: false, error: 'No active Supabase session' };
    }
    
    console.log('✅ Supabase authentication is working!', session.user.id);
    return { success: true, message: 'Supabase authentication is working correctly', userId: session.user.id };
  } catch (error: any) {
    console.error('❌ Supabase auth error:', error);
    return { success: false, error: error.message };
  }
};

// Test task retrieval for a specific user
export const testTaskRetrieval = async (userId: string) => {
  try {
    console.log('🔍 Testing task retrieval for user:', userId);
    
    const { data: tasks, error } = await supabase
      .from(TABLES.TASKS)
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error('❌ Task retrieval error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Task retrieval is working!', tasks?.length || 0, 'tasks found');
    return { success: true, message: 'Task retrieval is working correctly', tasks: tasks || [] };
  } catch (error: any) {
    console.error('❌ Task retrieval error:', error);
    return { success: false, error: error.message };
  }
};

// Run all Supabase tests
export const runSupabaseTests = async (userId?: string) => {
  console.log('🔍 Running Supabase connection tests...');
  
  const connectionTest = await testSupabaseConnection();
  const authTest = await testSupabaseAuth();
  
  let taskTest = { success: false, error: 'No user ID provided' };
  if (userId) {
    taskTest = await testTaskRetrieval(userId);
  }
  
  return {
    connection: connectionTest,
    auth: authTest,
    tasks: taskTest,
    overall: connectionTest.success && authTest.success
  };
};
