import { LoaderFunction } from "remix";
import * as mtgCard from "~/models/card.server";

export const loader: LoaderFunction = async ({ params }) => {
  const faces = await mtgCard.getFaces(params.cardId || "");
  if (!faces || !faces[0].imageUri) {
    throw new Response("Card not found", { status: 404 });
  }

  return new Response(null, {
    status: 301,
    headers: { Location: faces[0].imageUri },
  });
  // todo: https://github.com/remix-run/remix/discussions/2618

  // const tree = new PrefixTree<string>();
  // for (const card of cards) {
  //   tree.add(card.name, card.id);
  // }

  // // yes, it'd be _nearly_ as compact (once gzipped) to simply output the
  // // card names and binary uuids. But this is far more fun.
  // return new Response(tree.serialize(uuidSerializer), {
  //   status: 200,
  //   headers: {
  //     "Content-Type": "application/octet-stream",
  //   },
  // });
};
