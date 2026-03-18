import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client (bypasses RLS) - only for API routes
export function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper for JSON responses
export function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return json({ error: message }, status);
}

export function notFound(message = 'Not found') {
  return error(message, 404);
}

export function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}
