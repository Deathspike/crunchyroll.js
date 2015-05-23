interface ISubtitleEvent {
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
