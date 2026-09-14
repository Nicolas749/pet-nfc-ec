import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { checkAdminAccess, verifyCsrfOrigin } from '@/lib/auth-utils';

export async function POST(request: Request): Promise<NextResponse> {
  const csrfError = verifyCsrfOrigin(request);
  if (csrfError) return csrfError;

  const { error } = await checkAdminAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    if (!request.body) {
       return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
