import { createServerClient } from '@supabase/ssr';

/**
 * API Route(서버 측)에서 Supabase Storage에 Base64 이미지를 업로드합니다.
 * SERVICE_ROLE_KEY 또는 ANON_KEY를 순서대로 시도합니다.
 */
export async function uploadBase64Image(
  base64Data: string,
  bucket: string,
  path: string
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Service Role Key가 있으면 우선 사용 (RLS 우회), 없으면 Anon Key 사용
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[uploadBase64Image] Missing Supabase credentials');
    return null;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  // Base64 데이터 부분 추출
  const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const mimeType = base64Data.includes(';')
    ? base64Data.split(';')[0].split(':')[1]
    : 'image/png';

  const binaryData = Buffer.from(base64, 'base64');

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, binaryData, { contentType: mimeType, upsert: true });

  if (error) {
    console.error('[uploadBase64Image] Upload error:', error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
