import { ActionFunction, LoaderFunction, redirect } from "remix";

import { authenticator } from "~/session.server";

export let loader: LoaderFunction = () => redirect("/login");

export let action: ActionFunction = ({ request }) =>
  authenticator.authenticate("auth0", request);
