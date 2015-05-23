interface IEpisodePlayer {
  subtitle?: {
    id: number;
    iv: string;
    data: string;
  };
  video: {
    file: string;
    host: string;
  };
}
