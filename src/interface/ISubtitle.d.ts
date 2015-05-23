interface ISubtitle {
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
