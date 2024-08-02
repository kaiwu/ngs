import { Ok, Error } from "./gleam.mjs"

export function to_headers(h) {
  return Headers(h);
}
