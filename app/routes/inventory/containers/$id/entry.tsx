import type { Condition } from "@prisma/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  useFetcher,
  useLoaderData,
} from "remix";
import { ConditionSelect } from "~/components/card/condition";
import {
  CardImage,
  CardPlaceholder,
  OwnedCardComponent,
} from "~/components/card/image";
import { Container as UIContainer } from "~/components/ui/container";
import { Header } from "~/components/ui/header";
import { BlockHint } from "~/components/ui/hintText";
import { Input, Select } from "~/components/ui/input";
import { PageTitle } from "~/components/ui/pageTitle";
import { classes } from "~/components/util/classes";
import * as card from "~/models/card.server";
import * as mtgCards from "~/models/card.server";
import * as containers from "~/models/container.server";
import * as mtgSets from "~/models/set.server";
import { PrefixTree } from "~/prefix-tree";
import { mustGetUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return json<LoaderData>({
    sets: await mtgSets.getSetsAndCodes(),
    contents: await containers.getContents(params.id!),
  });
};

const enum ActionType {
  Add,
  ToggleFoil,
  SetQuality,
  Delete,
}

type SubmitAction = {
  type: ActionType.Add;
  cardId: string;
  condition: Condition;
  finish: card.FinishType;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const user = await mustGetUser(request);

  const body = {
    cardId: formData.get("cardId") as string,
    condition: formData.get("condition") as Condition,
    finish: Number(formData.get("finish")) as card.FinishType,
    userId: user.id,
    location: {
      id: params.id!,
      x: 0,
      y: 0,
      z: 0,
    },
  };

  const validationResult = mtgCards.createOwnedCardSchema.validate(body);
  if (validationResult.error) {
    return json(validationResult.error);
  }

  const card = await mtgCards.createOwnedCard(body);

  return json(card);
};

interface LoaderData {
  sets: Awaited<ReturnType<typeof mtgSets["getSetsAndCodes"]>>;
  contents: card.OwnedCard[];
}

const ANY_SET = "*";
const EMPTY_TREE = new PrefixTree<never>();
const DISPLAYED_RESULTS = 5;

export default function Products() {
  const { sets, contents: _contents } = useLoaderData<LoaderData>();
  const [contents, setContents] = useState(_contents);
  const prefixFetcher = useFetcher<card.ICardWithName[]>();
  const submitFetcher = useFetcher<card.OwnedCard>();
  const [currentSet, setCurrentSet] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const prefixTree = useMemo(() => {
    if (!prefixFetcher.data) {
      return EMPTY_TREE;
    }

    const tree = new PrefixTree<card.ICardWithName>();
    for (const card of prefixFetcher.data) {
      tree.add(card.name.toLowerCase(), card);
    }
    return tree;
  }, [prefixFetcher.data]);

  const searchResults = useMemo(
    () =>
      query
        ? prefixTree
            .search(query.toLowerCase())
            .sort((a, b) => a.key.localeCompare(b.key))
        : [],
    [query, prefixTree]
  );

  useEffect(() => {
    if (submitFetcher.data) {
      setContents((c) => [submitFetcher.data!, ...c]);
    }
  }, [submitFetcher.data]);

  useEffect(() => {
    if (currentSet) {
      prefixFetcher.load(
        currentSet === "*" ? "/api/names" : `/api/sets/${currentSet}/names`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet]);

  return (
    <>
      <Header category="Inventory" />
      <PageTitle>Add Cards</PageTitle>
      <UIContainer>
        <form
          method="post"
          className="mb-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitFetcher.submit(e.target as HTMLFormElement);
          }}
        >
          <Select
            value={currentSet}
            className="w-48"
            onChange={(e) => setCurrentSet(e.target.value)}
          >
            <option value="">Pick Set</option>
            <option value="*">All Sets</option>
            <>
              {sets.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.code.toUpperCase()}: {s.name}
                </option>
              ))}
            </>
          </Select>
          <Input
            placeholder="Card name..."
            containerClassName="grow"
            type="search"
            autoCorrect="off"
            autoFocus
            autoCapitalize="off"
            value={query}
            onKeyDown={useCallback((e: React.KeyboardEvent) => {
              switch (e.key) {
                case "ArrowLeft":
                  setSelected((s) => (s === 0 ? DISPLAYED_RESULTS - 1 : s - 1));
                  break;
                case "ArrowRight":
                  setSelected((s) => (s + 1) % DISPLAYED_RESULTS);
                  break;
                default:
                  return;
              }
              e.preventDefault();
            }, [])}
            onChange={useCallback((e) => {
              setQuery(e.target.value);
              setSelected(0);
              setCurrentSet((s) => s || ANY_SET);
            }, [])}
          />
          <ConditionSelect
            name="condition"
            className="w-32"
            defaultValue="LP"
          />
          <input
            type="hidden"
            name="cardId"
            value={searchResults[selected]?.value.id}
          />
          <input type="hidden" name="action" value={ActionType.Add} />
          <input type="hidden" name="finish" value="1" />
        </form>
        <Hint />
      </UIContainer>
      {!!searchResults.length && (
        <ul className="flex justify-center overflow-hidden bg-zinc-100 py-4">
          {searchResults.slice(0, 6).map(({ value }, i) => (
            <div className="w-1/2 md:w-1/4 lg:w-1/6" key={value.id}>
              <CardButton card={value} selected={selected === i} />
            </div>
          ))}
        </ul>
      )}
      <UIContainer>
        {contents.map((c) => (
          <div className="w-1/2 md:w-1/4 lg:w-1/6" key={c.id}>
            <OwnedCardComponent card={c} />
          </div>
        ))}
      </UIContainer>
    </>
  );
}

const Hint: React.FC = () => {
  const modKey =
    typeof window !== "undefined" && window.navigator.userAgent.includes("Mac")
      ? "⌘"
      : "Ctrl";

  return (
    <BlockHint>
      <p>This page uses keyboard shortcuts to make data entry a snap!</p>
      <ul className="px-8">
        <li className="list-disc">
          Search for a card name, then use ➡️ and ⬅️ to select the card and
          Enter to add it.
        </li>
        <li className="list-disc">
          Use ⬆️ to duplicate the last card or ⬇️ to remove it.
        </li>
        <li className="list-disc">
          {modKey}+F toggles whether the last card is foil, and {modKey}+1 to{" "}
          {modKey}+5 sets its condition from Near Mint to Damaged.
        </li>
      </ul>
    </BlockHint>
  );
};

const CardButton: React.FC<{
  card: card.ICardWithName;
  selected?: boolean;
}> = ({ card, selected }) => {
  const [revealed, setRevealed] = useState(false);

  // delay loading the card images to avoid lots of network req's while
  // the user is typing
  useEffect(() => {
    setRevealed(false);
    const timeout = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timeout);
  }, [card]);

  return (
    <button
      className={classes(
        "w-full rounded-sm p-4",
        selected && "ring-2 ring-sky-600 ring-offset-sky-300"
      )}
    >
      {revealed ? (
        <CardImage id={card.id} name={card.name} />
      ) : (
        <CardPlaceholder />
      )}
      <small className="text-xs">{card.set.name}</small>
    </button>
  );
};
