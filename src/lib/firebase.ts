
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

// Add the missing logoutUser function
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Add the missing onActiveMediaChange function
export const onActiveMediaChange = (callback: (media: any) => void) => {
  // Subscribe to changes on the active_media table
  const channel = supabase
    .channel('active_media_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_media',
      },
      async (payload) => {
        try {
          // When there's a change in active_media, fetch the associated media data
          // Fix: Add proper type checking for payload.new before accessing media_id
          if (payload.new && typeof payload.new === 'object' && 'media_id' in payload.new && payload.new.media_id) {
            const { data: mediaData } = await supabase
              .from('media')
              .select('*')
              .eq('id', payload.new.media_id)
              .single();
            
            callback(mediaData);
          } else {
            // If media_id is null or the record was deleted, pass null to indicate no active media
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching media details:', error);
          callback(null);
        }
      }
    )
    .subscribe();

  // Also fetch current active media when first subscribing
  const fetchInitialMedia = async () => {
    try {
      const { data } = await supabase
        .from('active_media')
        .select('media_id')
        .order('activated_at', { ascending: false })
        .limit(1)
        .single();
      
      // Fix: Add proper type checking for data before accessing media_id
      if (data && typeof data === 'object' && 'media_id' in data && data.media_id) {
        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('id', data.media_id)
          .single();
        
        callback(mediaData);
      } else {
        callback(null);
      }
    } catch (error) {
      console.error('Error fetching initial media:', error);
      callback(null);
    }
  };
  
  fetchInitialMedia();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
