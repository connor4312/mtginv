import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import * as containers from "~/models/container.server";
import { ContainerOverview } from "~/components/containers/containerOverview";
import { LinkButton } from "~/components/ui/button";
import { ActionTitle } from "~/components/ui/pageTitle";
import { mustGetUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await mustGetUser(request);

  return json<LoaderData>({
    containers: await containers.getAll(user.id),
  });
};

interface LoaderData {
  containers: containers.ContainerOverview[];
}

export default function Products() {
  const { containers } = useLoaderData<LoaderData>();
  return (
    <div>
      <ActionTitle title="Inventory">
        <LinkButton primary to="/inventory/new">
          New Container
        </LinkButton>
        <LinkButton to="/inventory/new">New Container</LinkButton>
      </ActionTitle>
      <p>
        Mtginv stores your cards in "containers." Decks, boxes, and binders are
        all different types of containers.
      </p>
      {containers.map((c) => (
        <ContainerOverview container={c} key={c.id} />
      ))}
    </div>
  );
}
