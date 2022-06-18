import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { ContainerOverview } from "~/components/containers/containerOverview";
import { LinkButton } from "~/components/ui/button";
import { Container as UIContainer } from "~/components/ui/container";
import { Header } from "~/components/ui/header";
import { ActionTitle } from "~/components/ui/pageTitle";
import * as containers from "~/models/container.server";
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

export default function Inventory() {
  const { containers } = useLoaderData<LoaderData>();
  return (
    <>
      <Header category="Inventory" />
      <ActionTitle title="Containers" sub="You have 1234 cards in 4 containers">
        <LinkButton primary to="/inventory/new">
          New Container
        </LinkButton>
        <LinkButton to="/inventory/new">New Container</LinkButton>
      </ActionTitle>
      <UIContainer>
        <p>
          Mtginv stores your cards in "containers." Decks, boxes, and binders
          are all different types of containers.
        </p>
        {containers.map((c) => (
          <ContainerOverview container={c} key={c.id} />
        ))}
      </UIContainer>
    </>
  );
}
