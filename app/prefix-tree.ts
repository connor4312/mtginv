import * as uuid from "uuid";

export interface ISerializer<T> {
  toBinary(value: T): Uint8Array;
  fromBinary(value: Uint8Array): T;
}

export const uuidSerializer: ISerializer<string> = {
  toBinary: (id) => uuid.parse(id) as Uint8Array,
  fromBinary: (id) => uuid.stringify(id),
};

const START_NODE = new Uint8Array([0]);
const START_VALUE = new Uint8Array([1]);
const END_NODE = new Uint8Array([2]);
const PREFIX_BUILDER = new Uint8Array(256);

/**
 * A small, serializable prefix tree.
 */
export class PrefixTree<T> {
  private value?: T[];
  private children?: Map<number, PrefixTree<T>>;

  public static deserialize<T>(
    input: Uint8Array,
    serializer: ISerializer<T>
  ): PrefixTree<T> {
    const deserializeNode = (parent: PrefixTree<T>, offset: number) => {
      offset++; // skip start of node

      let prefixLen = input[offset++];
      let node = parent;
      while (prefixLen-- > 0) {
        node = node._getOrCreateNode(input[offset++]);
      }

      if (input[offset] === START_VALUE[0]) {
        node.value = [];
        while (input[offset] === START_VALUE[0]) {
          offset++; // skip start of value
          const len = input[offset++];
          node.value.push(
            serializer.fromBinary(input.subarray(offset, offset + len))
          );
          offset += len;
        }
      }

      while (input[offset] === START_NODE[0]) {
        offset = deserializeNode(node, offset);
      }

      offset++; // skip end node

      return offset;
    };

    const root = new PrefixTree<T>();
    deserializeNode(root, 0);
    return root.children!.values().next().value;
  }

  /** Adds a new item to the prefix tree. */
  public add(key: string, value: T, pi = 0) {
    if (pi < key.length) {
      this._getOrCreateNode(key.charCodeAt(pi)).add(key, value, pi + 1);
    } else {
      this.value ??= [];
      this.value.push(value);
    }
  }

  private _getOrCreateNode(char: number): PrefixTree<T> {
    this.children ??= new Map();
    let node = this.children.get(char);
    if (!node) {
      node = new PrefixTree();
      this.children.set(char, node);
    }
    return node;
  }

  /** Gets all nodes that have the given prefix. */
  public search(prefix: string) {
    const results: { key: string; value: T }[] = [];
    this._search(prefix, 0, results);
    return results;
  }

  /**
   * Serializes the tree to a compact, binary format. The format is
   *
   * 0x00  - start node
   * <any> - prefix byte
   * 0x01  - start value (option, repeat)
   *     <any>  - value length byte (max 255)
   *     <any>* - value contents
   * <optional child nodes>
   * 0x02 - end node
   */
  public serialize(serializer: ISerializer<T>) {
    const parts: Uint8Array[] = [];
    this._serialize(0, parts, serializer);

    let length = 0;
    for (const part of parts) {
      length += part.byteLength;
    }

    const output = new Uint8Array(length);
    let i = 0;
    for (const part of parts) {
      output.set(part, i);
      i += part.byteLength;
    }

    return output;
  }

  private _serialize(
    prefix: number,
    parts: Uint8Array[],
    serializer: ISerializer<T>
  ) {
    parts.push(START_NODE);

    let target = this;
    let prefixLen = 0;
    PREFIX_BUILDER[prefixLen++] = prefix;
    while (
      !target.value &&
      target.children?.size === 1 &&
      prefixLen < PREFIX_BUILDER.length
    ) {
      const [char, _target] = target.children.entries().next().value;
      target = _target;
      PREFIX_BUILDER[prefixLen++] = char;
    }

    parts.push(new Uint8Array([prefixLen]));
    parts.push(PREFIX_BUILDER.slice(0, prefixLen));

    if (target.value) {
      for (const value of target.value) {
        const valueBytes = serializer.toBinary(value);
        if (valueBytes.length > 255) {
          throw new Error(
            `Cannot serialize more than 255 bytes for value: ${JSON.stringify(
              value
            )}`
          );
        }

        parts.push(START_VALUE);
        parts.push(new Uint8Array([valueBytes.length]));
        parts.push(valueBytes);
      }
    }

    if (target.children) {
      for (const [char, value] of target.children) {
        value._serialize(char, parts, serializer);
      }
    }

    parts.push(END_NODE);
  }

  private _search(
    prefix: string,
    pi = 0,
    results: { key: string; value: T }[],
    extra = ""
  ) {
    if (pi < prefix.length) {
      this.children
        ?.get(prefix.charCodeAt(pi))
        ?._search(prefix, pi + 1, results);
      return;
    }

    if (this.children) {
      for (const [char, child] of this.children) {
        child._search(prefix, pi, results, extra + String.fromCharCode(char));
      }
    }

    if (this.value) {
      results.push(
        ...this.value.map((value) => ({ key: prefix + extra, value }))
      );
    }
  }
}
