
import { supabase } from "@/lib/supabase-client";

export const syncMedia = async (mediaId: string | null, userId: string) => {
  try {
    // First delete existing active media for this controller
    await supabase
      .from('active_media')
      .delete()
      .eq('controller_id', userId);
    
    // If we have a new media ID, insert it
    if (mediaId) {
      await supabase
        .from('active_media')
        .insert({
          media_id: mediaId,
          controller_id: userId
        });
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing media:", error);
    throw error;
  }
};

export const trackInteraction = async (mediaId: string) => {
  try {
    await supabase.rpc('increment_media_interaction', { media_id: mediaId });
    return true;
  } catch (error) {
    console.error("Error tracking interaction:", error);
    return false;
  }
};

export const getRemainingTime = async (mediaId: string) => {
  try {
    const { data } = await supabase
      .from('media')
      .select('timeSlotEnd')
      .eq('id', mediaId)
      .single();
    
    if (data && data.timeSlotEnd) {
      const now = Date.now();
      const endTime = new Date(data.timeSlotEnd).getTime();
      return Math.max(0, endTime - now);
    }
    return null;
  } catch (error) {
    console.error("Error getting remaining time:", error);
    return null;
  }
};
