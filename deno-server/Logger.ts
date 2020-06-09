import { Houston, ConsoleTransport } from 'https://deno.land/x/houston/mod.ts'

export const Logger = new Houston([
  new ConsoleTransport()
]);
