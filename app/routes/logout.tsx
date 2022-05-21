import type { LoaderFunction } from "remix";
import { authenticator } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) =>
  authenticator.logout(request, { redirectTo: "/" });
