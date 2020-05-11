import { Schema, Node, Mark } from 'prosemirror-model';
import {
  MarkdownSerializer,
  defaultMarkdownSerializer,
  MarkdownSerializerState,
  MarkdownMarkType,
  MarkdownNodeType,
} from 'prosemirror-markdown';
import { PmBaseMdxNodeType } from '../prosemirror/createNodesConfig';

type NodeSerializer<S extends Schema> = (
  state: MarkdownSerializerState,
  node: Node<S>,
  parent: Node<S>
) => void;

type MarkDelimeter<S extends Schema> =
  | string
  | ((
      state: MarkdownSerializerState,
      mark: Mark<S>,
      parent: Node<S>,
      index: number
    ) => string);

type MarkSerializer<S extends Schema> = {
  open: MarkDelimeter<S>;
  close: MarkDelimeter<S>;
  mixable?: boolean;
  expelEnclosingWhitespace?: boolean;
  escape?: boolean;
};

export function defaultMdxNodeSerializer<S extends Schema>(
  state: MarkdownSerializerState,
  node: Node<S>,
  parent: Node<S>
): void {
  state.ensureNewLine();
  state.write(node.attrs.value);
  state.ensureNewLine();
  state.closeBlock(node);
}

export default function createMdxSerializer<
  N extends string,
  M extends string
>({
  nodes,
  marks,
}: {
  nodes: Record<
    N,
    NodeSerializer<Schema<N | PmBaseMdxNodeType, M | MarkdownMarkType>>
  >;
  marks: Record<
    M,
    MarkSerializer<Schema<N | PmBaseMdxNodeType, M | MarkdownMarkType>>
  >;
}): MarkdownSerializer<N | PmBaseMdxNodeType, M | MarkdownMarkType> {
  const nodeSerializers: Record<N | PmBaseMdxNodeType, any> = {
    ...defaultMarkdownSerializer.nodes,
    ...nodes,
    mdx_import: defaultMdxNodeSerializer,
    mdx_export: defaultMdxNodeSerializer,
    mdx_jsx: defaultMdxNodeSerializer,
  } as Record<N | PmBaseMdxNodeType, any>;
  const markSerializers: Record<M | MarkdownMarkType, any> = {
    ...defaultMarkdownSerializer.marks,
    ...(marks as any),
  };
  return new MarkdownSerializer<N | PmBaseMdxNodeType, M | MarkdownMarkType>(
    nodeSerializers,
    markSerializers
  );
}
