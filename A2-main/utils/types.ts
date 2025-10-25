/* Represents the payload from Spotify's token endpoint. */
export type SpotifyAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export type Track = {
  songTitle: string;
  songArtists: { name: string }[] | undefined;
  albumName?: string;
  imageUrl?: string;
  duration: number;
  externalUrl?: string;
  previewUrl?: string;
};