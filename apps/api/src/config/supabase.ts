import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Detailed logging for debugging
console.log('🔍 Checking Supabase environment variables...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? `✅ Set (${process.env.SUPABASE_URL.substring(0, 20)}...)` : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})` : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? `✅ Set (length: ${process.env.SUPABASE_ANON_KEY.length})` : '❌ Missing');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');

  console.error('❌ Missing Supabase environment variables:', missing.join(', '));
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '));
  
  throw new Error(
    `Missing Supabase environment variables: ${missing.join(', ')}. ` +
      `Please ensure these are set in your environment or Google Cloud Secret Manager.`
  );
}

console.log('✅ All Supabase environment variables are present');

// Admin client for server-side operations
console.log('🔧 Creating supabaseAdmin client...');
let supabaseAdmin;
try {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ supabaseAdmin client created successfully');
} catch (error) {
  console.error('❌ Failed to create supabaseAdmin client:', error);
  console.error('supabaseUrl:', supabaseUrl);
  console.error('supabaseServiceKey type:', typeof supabaseServiceKey);
  console.error('supabaseServiceKey length:', supabaseServiceKey?.length);
  throw error;
}

console.log('🔧 Creating supabaseAuth client...');
let supabaseAuth;
try {
  supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ supabaseAuth client created successfully');
} catch (error) {
  console.error('❌ Failed to create supabaseAuth client:', error);
  console.error('supabaseUrl:', supabaseUrl);
  console.error('supabaseAnonKey type:', typeof supabaseAnonKey);
  console.error('supabaseAnonKey length:', supabaseAnonKey?.length);
  console.error('supabaseAnonKey value (first 20 chars):', supabaseAnonKey?.substring(0, 20));
  throw error;
}

export { supabaseAdmin, supabaseAuth };

// Client for user-specific operations
export const createUserClient = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export default supabaseAdmin;
