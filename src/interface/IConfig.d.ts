interface IConfig {
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
