import { draftMode } from "next/headers";

/** Turns draft mode off and returns to the published site. */
export async function GET(request: Request) {
  (await draftMode()).disable();
  return Response.redirect(new URL("/", request.url));
}
