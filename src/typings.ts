export interface IConfig {
  // Authentication
  pass?: string;
  user?: string;
  // Disables
  cache?: boolean;
  merge?: boolean;
  // Filters
  episode?: number;
  volume?: number;
  // Settings
  format?: string;
  output?: string;
  series?: string;
  tag?: string;
}

export interface IConfigLine extends IConfig {
  args: string[];
}

export interface IConfigTask {
  address: string;
  config: IConfigLine;
}

export interface IEpisodePage {
  id: number;
  episode: number;
  series: string;
  volume: number;
  swf: string;
}

export interface IEpisodePlayer {
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

export interface IEpisodePlayerConfig {
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

export interface IFormatterTable {
  [key: string]: (input: string|Buffer, done: (err: Error, subtitle?: string) => void) => void;
}

export interface ISeries {
  episodes: ISeriesEpisode[];
  series: string;
}

export interface ISeriesEpisode {
  address: string;
  episode: number;
  volume: number;
}

export interface ISubtitle {
  $: {
    title: string;
    wrap_style: string;
    play_res_x: string;
    play_res_y: string;
    id: string;
    lang_string: string;
    created: string;
  };
  events: ISubtitleEvent;
  styles: ISubtitleStyle;
}

export interface ISubtitleEvent {
  event: {
    $: {
      end: string;
      start: string;
      style: string;
      name: string;
      margin_l: string;
      margin_r: string;
      margin_v: string;
      effect: string;
      text: string;
    };
  }[];
}

export interface ISubtitleStyle {
  style: {
    $: {
      name: string;
      font_name: string;
      font_size: string;
      primary_colour: string;
      secondary_colour: string;
      outline_colour: string;
      back_colour: string;
      bold: string;
      italic: string;
      underline: string;
      strikeout: string;
      scale_x: string;
      scale_y: string;
      spacing: string;
      angle: string;
      border_style: string;
      outline: string;
      shadow: string;
      alignment: string;
      margin_l: string;
      margin_r: string;
      margin_v: string;
      encoding: string;
    };
  }[];
}
