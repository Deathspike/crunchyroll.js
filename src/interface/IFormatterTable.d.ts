interface IFormatterTable {
  [key: string]: (input: string|Buffer, done: (err: Error, subtitle?: string) => void) => void;
}
