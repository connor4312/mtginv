import * as mtgCard from "~/models/card.server";

export const loader = async () => {
  const cards = await mtgCard.getAllNames();
  return cards;
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
