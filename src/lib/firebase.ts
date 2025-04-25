
import { supabase } from "@/lib/supabase-client";
import { Database } from "@/types/database.types";

type ActiveMediaRow = Database['public']['Tables']['active_media']['Row'];
type MediaRow = Database['public']['Tables']['media']['Row'];

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
    const { error } = await supabase.rpc('increment_media_interaction', { media_id: mediaId });
    
    if (error) {
      console.error("Error incrementing interaction:", error);
      return false;
    }
    
    console.log("Media interaction tracked successfully for ID:", mediaId);
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
      .select('timeslotend')
      .eq('id', mediaId)
      .single();
    
    if (data && data.timeslotend) {
      const now = Date.now();
      const endTime = new Date(data.timeslotend).getTime();
      return Math.max(0, endTime - now);
    }
    return null;
  } catch (error) {
    console.error("Error getting remaining time:", error);
    return null;
  }
};

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};

export const onActiveMediaChange = (callback: (media: MediaRow | null) => void) => {
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
          if (
            payload.new &&
            typeof payload.new === 'object' &&
            'media_id' in payload.new &&
            payload.new.media_id
          ) {
            const { data: mediaData } = await supabase
              .from('media')
              .select('*')
              .eq('id', payload.new.media_id)
              .single();
            
            callback(mediaData || null);
          } else {
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
      
      if (data && typeof data === 'object' && 'media_id' in data && data.media_id) {
        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('id', data.media_id)
          .single();
        
        callback(mediaData || null);
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
