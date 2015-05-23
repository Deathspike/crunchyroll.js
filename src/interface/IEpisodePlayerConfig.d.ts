interface IEpisodePlayerConfig {
  'default:preload': {
    subtitle: {
      $: {
        id: string;
      };
      iv: string;
      data: string;
    };
    stream_info: {
      file: string;
      host: string;
    };
  };
}
