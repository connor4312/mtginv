import React from "react";
import { ContainerOverview as OverviewModel } from "~/models/container.server";
import { LinkButton } from "../ui/button";

export const ContainerOverview: React.FC<{ container: OverviewModel }> = ({
  container,
}) => {
  return (
    <div>
      <h2>{container.name}</h2>
      Contains:
      <ul>
        {container.contents.map((c, i) => (
          <li key={i}>{c.ownedCard.card.name}</li>
        ))}
      </ul>
      <LinkButton to={`/inventory/containers/${container.id}/entry`}>
        Add
      </LinkButton>
    </div>
  );
};
