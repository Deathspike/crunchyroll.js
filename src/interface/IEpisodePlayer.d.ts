interface IEpisodePlayer {
  subtitle?: {
    id: number;
    iv: string;
    data: string;
  };
  video: {
    mode: string;
    file: string;
    host: string;
  };
}
