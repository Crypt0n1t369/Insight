import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Helper to get Supabase client and handle errors
export async function getSupabase() {
  const supabase = await createClient();
  return supabase;
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
