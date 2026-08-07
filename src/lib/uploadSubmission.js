import { supabase } from './supabase';

/**
 * Uploads an image or video file to Supabase Storage in the "submissions" bucket.
 * Returns the public URL of the uploaded file.
 * 
 * @param {File} file - Image or Video file to upload
 * @returns {Promise<string>} Public URL of the uploaded media
 */
export async function uploadSubmissionMedia(file) {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `submission_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `media/${fileName}`;

    // Upload to 'submissions' bucket in Supabase Storage
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload fallback:', error.message);
      // Fallback: Convert to Data URL if bucket is not yet provisioned in demo
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('File upload error:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}
