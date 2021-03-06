import type { OwnedCard } from "~/models/card.server";
import { formatUSD } from "../ui/i18n";

export const CardImage: React.FC<{
  id: string;
  name?: string;
  className?: string;
}> = ({ id, name, className }) => (
  <img
    src={`/api/cards/${id}/image`}
    style={{ borderRadius: "5% / 3.6%", aspectRatio: "0.72 / 1" }}
    alt={name}
    className={className}
    loading="lazy"
  />
);

export const CardPlaceholder = () => (
  <div
    className="bg-zinc-300"
    style={{ borderRadius: "5% / 3.6%", aspectRatio: "0.72 / 1" }}
  />
);

export const OwnedCardComponent: React.FC<{
  card: OwnedCard;
}> = ({ card }) => (
  <div>
    <CardImage id={card.card.id} name={card.card.name} />
    <span>
      {formatUSD(card.card.finishes.find((f) => f.type === card.finish)?.price)}
    </span>
  </div>
);
