import { Color, Rarity } from "@prisma/client";
import { ActionFunction, json } from "remix";
import * as mtgCard from "~/models/card.server";
import * as mtgSet from "~/models/set.server";

const getScryfallJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} response from  ${url}: ${await res.text()}`);
  }

  return res.json();
};

const getScryfallList = async <T>(url: string): Promise<T[]> => {
  let data: T[] = [];
  while (true) {
    const res = await getScryfallJson<SFList<T>>(url);
    data = data.concat(res.data);
    if (res.next_page && res.has_more) {
      url = res.next_page;
    } else {
      break;
    }
  }

  return data;
};

const ignoreSetTypes = new Set(["memorabilia", "alchemy"]);

const syncSets = async () => {
  const sets = await getScryfallList<SFSet>("https://api.scryfall.com/sets");
  console.log("syncing sets:", sets.length);
  return mtgSet.upsertAll(
    sets
      .filter((s) => !ignoreSetTypes.has(s.set_type))
      .map((s) => ({
        id: s.id,
        code: s.code,
        tcgPlayerId: s.tcgplayer_id || null,
        releaseDate: s.released_at ? new Date(s.released_at) : null,
        cardCount: s.card_count,
        iconUri: s.icon_svg_uri,
        name: s.name,
        scryfallUri: s.scryfall_uri,
      }))
  );
};

const syncCards = async () => {
  const bulk = await getScryfallList<SFBulkData>(
    "https://api.scryfall.com/bulk-data"
  );
  const cardObj = bulk.find((d) => d.type === "default_cards");
  if (!cardObj) {
    throw new Error("no default_cards in bulk data");
  }

  const bulkSize = 500;
  const cards = await getScryfallJson<SFCard[]>(cardObj.download_uri);
  for (let i = 0; i < cards.length; i += bulkSize) {
    console.log("syncing cards:", i, "to", i + bulkSize);
    await mtgCard.upsertAll(
      cards
        .slice(i, i + bulkSize)
        .filter((card) => !ignoreSetTypes.has(card.set_type))
        .map(
          (s): mtgCard.Card => ({
            id: s.id,
            oracleId: s.oracle_id,
            collectorNumber: s.collector_number || "N/A",
            tcgPlayerId: s.tcgplayer_id || null,
            name: s.name,
            lang: s.lang,
            manaCost: s.mana_cost || "",
            faces: getFaces(s),
            edhrecRank: s.edhrec_rank || null,
            rarity: rarityMapping[s.rarity],
            scryfallUri: s.scryfall_uri,
            colorIdentity: s.color_identity.map((c) => Color.Black),
            finishes: s.finishes.map((f) => ({
              type: finishMapping[f],
              price: makeCents(
                f === SFFinish.Foil
                  ? s.prices.usd_foil
                  : f === SFFinish.Nonfoil
                  ? s.prices.usd
                  : f === SFFinish.Etched
                  ? s.prices.usd_etched
                  : undefined
              ),
            })),
            setId: s.set_id,
            releasedAt: new Date(s.released_at),
          })
        )
    );
  }

  return cards;
};

export const action: ActionFunction = async () => {
  return json({
    sets: (await syncSets()).length,
    cards: (await syncCards()).length,
  });
};

interface SFList<T> {
  object: "list";
  has_more: boolean;
  next_page?: string;
  data: T[];
}

interface SFSet {
  object: "set";
  id: string;
  code: string;
  name: string;
  uri: string;
  mtgo_code?: string;
  tcgplayer_id?: number;
  scryfall_uri: string;
  search_uri: string;
  released_at?: string;
  set_type: string;
  card_count: number;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  icon_svg_uri: string;
  block_code?: string;
  printed_size?: number;
  block?: string;
  parent_set_code?: string;
}

interface SFBulkData {
  object: "bulk_data";
  id: string;
  type: string;
  updated_at: string;
  uri: string;
  name: string;
  description: string;
  compressed_size: number;
  download_uri: string;
  content_type: string;
  content_encoding: string;
}
enum SFColor {
  White = "W",
  Black = "B",
  Red = "R",
  Blue = "U",
  Green = "G",
}

interface SFRelatedCard {
  object: "related_card";
  id: string;
  component: string;
  name: string;
  type_line: string;
  uri: string;
}

const enum SFLegality {
  Legal = "legal",
  NotLegal = "not_legal",
  Banned = "banned",
  Restricted = "restricted",
}

const enum SFFinish {
  Foil = "foil",
  Nonfoil = "nonfoil",
  Etched = "etched",
  Glossy = "glossy",
}

const enum SFIllustrationStatus {
  Missing = "missing",
  Placeholder = "placeholder",
  Lowres = "lowres",
  HighresScan = "highres_scan",
}

const enum SFRarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Special = "special",
  Mythic = "mythic",
  Bonus = "bonus",
}

const makeCents = (float: string | null | undefined) =>
  float ? Math.round(Number(float) * 100) : undefined;

const getFaces = (card: SFCard): mtgCard.CardFace[] => {
  if (!card.card_faces) {
    return [
      {
        name: card.name,
        oracleId: card.oracle_id,
        imageUri: card.image_uris?.normal,
        manaCost: card.mana_cost,
        typeLine: card.type_line,
      },
    ];
  } else {
    return card.card_faces.map((c) => ({
      name: c.name,
      oracleId: c.oracle_id,
      imageUri: c.image_uris?.normal,
      manaCost: c.mana_cost,
      typeLine: c.type_line,
    }));
  }
};

const finishMapping: { [K in SFFinish]: mtgCard.FinishType } = {
  [SFFinish.Etched]: mtgCard.FinishType.Etched,
  [SFFinish.Nonfoil]: mtgCard.FinishType.Nonfoil,
  [SFFinish.Foil]: mtgCard.FinishType.Foil,
  [SFFinish.Glossy]: mtgCard.FinishType.Glossy,
};

const rarityMapping: { [K in SFRarity]: Rarity } = {
  [SFRarity.Common]: Rarity.Common,
  [SFRarity.Uncommon]: Rarity.Uncommon,
  [SFRarity.Rare]: Rarity.Rare,
  [SFRarity.Special]: Rarity.Special,
  [SFRarity.Mythic]: Rarity.Mythic,
  [SFRarity.Bonus]: Rarity.Bonus,
};

interface SFCardFace {
  object: "card_face";
  artist?: string;
  cmc?: number;
  color_indicator?: SFColor[];
  colors?: SFColor[];
  flavor_text?: string;
  illustration_id?: string;
  image_uris?: SFImageUris;
  layout?: string;
  loyalty?: string;
  mana_cost: string;
  name: string;
  oracle_id?: string;
  oracle_text?: string;
  power?: string;
  printed_name?: string;
  printed_text?: string;
  printed_type_line?: string;
  toughness?: string;
  type_line: string;
  watermark?: string;
}

interface SFPreview {
  previewed_at?: string;
  source_uri?: string;
  source?: string | null;
}

interface SFCard {
  // core card fields
  object: "card";
  id: string;
  oracle_id: string;
  multiverse_ids?: number[];
  mtgo_id?: number;
  mtgo_foil_id?: number;
  tcgplayer_id?: number;
  tcgplayer_etched_id?: number;
  cardmarket_id?: number;
  name: string;
  lang: string;
  prints_search_uri: string;
  rulings_uri: string;
  scryfall_uri: string;

  // gameplay fields
  all_parts?: SFRelatedCard[];
  card_faces?: SFCardFace[];
  cmc: number;
  color_identity: SFColor[];
  color_indicator?: SFColor[];
  colors?: SFColor[];
  edhrec_rank?: number;
  hand_modifier?: string;
  keywords: string[];
  layout: string;
  legalities: Record<string, SFLegality>;
  life_modifier?: string;
  loyalty?: string;
  mana_cost?: string;
  oracle_text?: string;
  oversized: boolean;
  power?: string;
  produced_mana: SFColor[];
  reserved: boolean;
  toughness?: string;
  type_line: string;

  // print fields
  artist?: string;
  booster: boolean;
  border_color: string;
  card_back_id: string;
  collector_number: string;
  content_warning?: boolean;
  digital: boolean;
  finishes: SFFinish[];
  flavor_name?: string;
  flavor_text?: string;
  frame_effects?: string[];
  frame: string;
  full_art: boolean;
  games: string[];
  highres_image: boolean;
  illustration_id?: string;
  image_status: SFIllustrationStatus;
  image_uris?: SFImageUris;
  prices: SFPrices;
  printed_name?: string;
  printed_text?: string;
  printed_type_line?: string;
  promo: boolean;
  promo_types?: string[];
  purchase_uris: SFPurchaseUris;
  rarity: SFRarity;
  related_uris: SFRelatedUris;
  released_at: string;
  reprint: boolean;
  scryfall_set_uri: string;
  set_name: string;
  set_search_uri: string;
  set_type: string;
  set_uri: string;
  set: string;
  set_id: string;
  story_spotlight: boolean;
  textless: boolean;
  variation: boolean;
  variation_of?: string;
  watermark?: string;
  preview?: SFPreview;
}

interface SFImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

interface SFPrices {
  usd?: string;
  usd_foil?: string;
  usd_etched?: string;
  eur?: string;
  eur_foil?: string;
  tix?: string;
}

interface SFRelatedUris {
  gatherer: string;
  tcgplayer_infinite_articles: string;
  tcgplayer_infinite_decks: string;
  edhrec: string;
  mtgtop8: string;
}

interface SFPurchaseUris {
  tcgplayer?: string;
  cardmarket?: string;
  cardhoarder?: string;
}
