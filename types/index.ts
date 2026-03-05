export interface Movie {
  id: string;
  title: string;
  imageSrc: string;
  slug: string;
  category?: { id: string; name: string }[];
}

export interface OphimMovie {
  _id: string;
  name: string;
  slug: string;
  thumb_url: string;
  poster_url?: string;
  year?: number;
}

export interface WatchHistoryItem {
  slug: string;
  timestamp: string;
}

export interface FavoriteItem {
  slug: string;
  timestamp: string;
}

export interface MovieDetails {
  movie: {
    tmdb?: { type: string; id: string | null };
    name: string;
    origin_name: string;
    content: string;
    type: string;
    status: string;
    thumb_url: string;
    poster_url: string;
    time: string;
    episode_current: string;
    episode_total: string;
    quality: string;
    lang: string;
    year: number;
    actor: string[];
    director: string[];
    category: { id: string; name: string }[];
    country: { id: string; name: string }[];
    trailer_url: string;
    slug: string;
  };
  episodes: {
    server_name: string;
    server_data: {
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }[];
  }[];
}
