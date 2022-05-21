import { ISerializer, PrefixTree } from "./prefix-tree";

describe("Prefix tree", () => {
  let sample: PrefixTree<string>;

  beforeEach(() => {
    sample = new PrefixTree();
    sample.add("hello", "a");
    sample.add("helvo", "b");
    sample.add("helloooo", "c");
    sample.add("goodbye", "d");
  });

  it("searches", () => {
    expect(sample.search("hel")).toEqual([
      { key: "helloooo", value: "c" },
      { key: "hello", value: "a" },
      { key: "helvo", value: "b" },
    ]);
    expect(sample.search("hello")).toEqual([
      { key: "helloooo", value: "c" },
      { key: "hello", value: "a" },
    ]);
  });

  it("round trips", () => {
    const serializer: ISerializer<string> = {
      fromBinary: (s) => String.fromCharCode(s[0]),
      toBinary: (s) => new Uint8Array([s.charCodeAt(0)]),
    };

    const serialized = sample.serialize(serializer);
    expect(serialized).toBeTruthy();

    const deserialized = PrefixTree.deserialize(serialized, serializer);
    expect(deserialized).toEqual(sample);
  });
});
