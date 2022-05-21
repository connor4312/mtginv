import { LoaderFunction } from "remix";
import { authenticator } from "~/session.server";

export const loader: LoaderFunction = ({ request }) =>
  authenticator.authenticate("auth0", request);
