import type { ContainerKind } from "@prisma/client";
import { ValidationError } from "joi";
import React from "react";
import {
  ActionFunction,
  Form,
  json,
  redirect,
  useActionData,
  useTransition,
} from "remix";
import { Button } from "~/components/ui/button";
import { Container as UIContainer } from "~/components/ui/container";
import { Header } from "~/components/ui/header";
import { BlockHint } from "~/components/ui/hintText";
import * as Icons from "~/components/ui/icons";
import { Input, InputGroup } from "~/components/ui/input";
import { EqualColumns } from "~/components/ui/layout";
import { PageTitle } from "~/components/ui/pageTitle";
import { classes } from "~/components/util/classes";
import * as containers from "~/models/container.server";
import { mustGetUser } from "~/session.server";

type ActionData = ValidationError;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const user = await mustGetUser(request);

  const body: containers.IContainerUpdate = {
    name: formData.get("name")?.toString() || "Unnamed Container",
    kind: formData.get("kind") as ContainerKind,
    maxX: Number(formData.get("maxX")) || 1,
    maxY: Number(formData.get("maxY")) || 1,
    maxZ: Number(formData.get("maxZ")) || 1,
    public: true,
  };

  const validationResult = containers.updateSchema.validate(body);
  if (validationResult.error) {
    return json(validationResult.error);
  }

  const container = await containers.create(user.id, body);
  return redirect(`/inventory/containers/${container.id}`);
};

export default function NewPost() {
  const [containerKind, setContainerKind] = React.useState<ContainerKind>();
  const transition = useTransition();
  const errors = useActionData<ActionData>();

  return (
    <>
      <Header category="Inventory" />
      <PageTitle>Create Container</PageTitle>
      <UIContainer>
        <Form method="post">
          <div className="flex justify-center">
            <ContainerTypeButton
              icon={Icons.Archive}
              type="Deck"
              value={containerKind}
              text="Deck"
              onSelect={setContainerKind}
            />
            <ContainerTypeButton
              icon={Icons.Archive}
              type="List"
              value={containerKind}
              text="List of Cards"
              onSelect={setContainerKind}
            />
            <ContainerTypeButton
              icon={Icons.Archive}
              type="Binder"
              value={containerKind}
              text="Binder"
              onSelect={setContainerKind}
            />
            <ContainerTypeButton
              icon={Icons.Archive}
              type="StorageBox"
              value={containerKind}
              text="Storage Box"
              onSelect={setContainerKind}
            />
          </div>
          {containerKind === "Deck" ? (
            <>
              <InputGroup label="Deck Name">
                <Input
                  name="name"
                  required
                  placeholder="Ornithopters Tribal"
                  errors={errors}
                />
              </InputGroup>
            </>
          ) : containerKind === "List" ? (
            <>
              <InputGroup label="List Name">
                <Input
                  name="name"
                  required
                  placeholder="My trades list"
                  errors={errors}
                />
              </InputGroup>
            </>
          ) : containerKind === "Binder" ? (
            <>
              <InputGroup label="Binder">
                <Input
                  name="name"
                  required
                  placeholder="Red Binder"
                  errors={errors}
                />
              </InputGroup>
              <CapacityHint />
              <EqualColumns className="gap-2">
                <InputGroup label="Number of Double-sided Pages">
                  <Input
                    name="maxZ"
                    required
                    step={1}
                    min={1}
                    placeholder="42"
                    errors={errors}
                  />
                </InputGroup>
                <InputGroup label="Number of Columns per Page">
                  <Input
                    name="maxX"
                    required
                    type="number"
                    step={1}
                    min={1}
                    defaultValue={4}
                  />
                </InputGroup>
                <InputGroup label="Number of Rows per Page">
                  <Input
                    name="maxY"
                    required
                    step={1}
                    min={1}
                    defaultValue={3}
                    errors={errors}
                  />
                </InputGroup>
              </EqualColumns>
            </>
          ) : containerKind === "StorageBox" ? (
            <>
              <InputGroup label="Box Name">
                <Input
                  name="name"
                  required
                  placeholder="Box #42"
                  errors={errors}
                />
                <CapacityHint />
                <InputGroup label="Number of column in the storage box">
                  <Input
                    name="maxX"
                    required
                    step={1}
                    min={1}
                    defaultValue={1}
                    errors={errors}
                  />
                </InputGroup>
                <InputGroup label="Approximate number of cards per column">
                  <Input
                    name="maxY"
                    required
                    step={1}
                    min={1}
                    defaultValue={400}
                    errors={errors}
                  />
                </InputGroup>
              </InputGroup>
            </>
          ) : null}
          <div className="flex justify-center">
            <Button
              primary={true}
              type="submit"
              disabled={!containerKind || !!transition.submission}
              className="mt-6"
            >
              Create Container
            </Button>
          </div>
        </Form>
      </UIContainer>
    </>
  );
}

const CapacityHint = () => (
  <BlockHint>
    <p>
      Mtginv helps you organize cards in the physical realm. To do that, we need
      some information about this container's size.
    </p>
  </BlockHint>
);

const ContainerTypeButton: React.FC<{
  type: ContainerKind;
  text: string;
  icon: Icons.Any;
  value: ContainerKind | undefined;
  onSelect: (value: ContainerKind) => void;
}> = ({ type, text, value, icon: Icon, onSelect }) => (
  <>
    <label
      className={classes(
        "mx-2 flex h-32 w-40 cursor-pointer flex-col items-center justify-center border-2  border-zinc-300 p-5 duration-100 focus-within:border-sky-500",
        value === type &&
          "rounded-sm border-sky-200 ring-2 ring-sky-600 ring-offset-2 ring-offset-sky-300"
      )}
    >
      <input
        type="radio"
        className="invisible h-0 w-0"
        name="kind"
        value={value}
        checked={value === type}
        onChange={(evt) => evt.target.checked && onSelect(type)}
      />
      <Icon className="mb-2 h-8" />
      {text}
    </label>
  </>
);
