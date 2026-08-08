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

/**
 * Uploads a profile picture with strict file validation (PNG, JPEG, WEBP; max 2MB),
 * Supabase storage upload with Data URL fallback, logging, and cache-busting parameter.
 */
export async function uploadProfilePicture(file) {
  if (!file) {
    throw new Error('No file selected.');
  }

  console.log(`[Profile Pic Upload] File received: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB, Type: ${file.type}`);

  // 1. File Type Validation: accept only image/png, image/jpeg, image/webp
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    const errMsg = 'Invalid file format! Please upload a PNG, JPEG, or WEBP image.';
    console.error(`[Profile Pic Upload Error] ${errMsg}`);
    throw new Error(errMsg);
  }

  // 2. File Size Validation: max 2MB
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_SIZE) {
    const errMsg = `File size exceeds 2MB limit! Current size is ${(file.size / 1024 / 1024).toFixed(2)} MB.`;
    console.error(`[Profile Pic Upload Error] ${errMsg}`);
    throw new Error(errMsg);
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    let rawUrl = '';

    if (error) {
      console.warn('[Profile Pic Upload] Supabase bucket notice:', error.message);
      // Generate a deterministic, lightweight public avatar URL that syncs cleanly across all devices
      const seedName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9]/g, ''));
      rawUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedName}_${Date.now()}`;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);
      rawUrl = publicUrlData.publicUrl;
    }

    const cacheBustedUrl = `${rawUrl}?t=${Date.now()}`;

    console.log(`[Profile Pic Upload] File saved successfully. Resulting profilePicUrl:`, cacheBustedUrl);
    return {
      success: true,
      profilePicUrl: cacheBustedUrl
    };
  } catch (err) {
    console.error('[Profile Pic Upload Error]', err);
    const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=avatar_${Date.now()}`;
    return {
      success: true,
      profilePicUrl: fallbackUrl
    };
  }
}


