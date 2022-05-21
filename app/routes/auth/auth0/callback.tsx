import { LoaderFunction } from 'remix';

import { authenticator } from "~/session.server";

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
