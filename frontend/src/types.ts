export interface ImageData {
  id: number;
  title: string;
  url: string;
  category: string;
  uploader_id?: number;
  uploader_type: string;
  uploader_name: string;
  uploader_avatar_url?: string;
  created_at: string;
  likes?: number;
  is_liked?: boolean;
  liked_by?: number[];
  description?: string;
  // Music-specific fields (for HipHop category)
  song_title?: string;
  artist?: string;
  redirect_url?: string;
}

export interface ImagesApiResponse {
  data: ImageData[];
  has_more: boolean;
}
