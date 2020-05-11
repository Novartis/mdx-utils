import {
  schema as baseMarkdownSchema,
  MarkdownNodeType,
} from 'prosemirror-markdown';
import { NodeSpec } from 'prosemirror-model';

export type PmNodeExtensions = Record<string, NodeSpec>;

type MdxNodeTypes = 'mdx_import' | 'mdx_export' | 'mdx_jsx' | 'mdx_inline_jsx';

export const MdxProsemirrorNodeSpecs: Record<string, NodeSpec> = {
  mdx_import: {
    atom: true,
    attrs: {
      value: {},
    },
    group: 'block',
    parseDOM: [{ tag: 'code[data-mdx="import"]' }],
    toDOM() {
      return ['code', { 'data-mdx': 'import' }];
    },
  },
  mdx_export: {
    atom: true,
    attrs: {
      value: {},
    },
    group: 'block',
    parseDOM: [{ tag: 'code[data-mdx="export"]' }],
    toDOM() {
      return ['code', { 'data-mdx': 'export' }];
    },
  },
  mdx_jsx: {
    atom: true,
    attrs: {
      value: {},
    },
    group: 'block',
    parseDOM: [{ tag: 'code[data-mdx="jsx"]' }],
    toDOM() {
      return ['code', { 'data-mdx': 'jsx' }];
    },
  },
  mdx_inline_jsx: {
    atom: true,
    inline: true,
    group: 'inline',
    attrs: {
      value: {},
    },
    parseDOM: [{ tag: 'code[data-mdx="jsx"]' }],
    toDOM() {
      return ['code', { 'data-mdx': 'inline_jsx' }];
    },
  },
};

export type PmBaseMdxNodeType = MdxNodeTypes | MarkdownNodeType;

// ProseMirror is strange in that the only way you can specify the root type of your document
// is by adding it as the first key in your object.
const copiedNodes = (() => {
  const copy = {};
  Object.keys(baseMarkdownSchema.nodes).forEach((key) => {
    if (key === 'doc') return;
    copy[key] = baseMarkdownSchema.nodes[key].spec;
  });
  return copy;
})();

const baseDocSpec = baseMarkdownSchema.nodes.doc.spec;
export function createNodesConfig<CustomNodes extends string>(
  customNodes: Record<CustomNodes, NodeSpec>
): Record<CustomNodes | MarkdownNodeType, NodeSpec> {
  return {
    doc: {
      ...baseDocSpec,
      attrs: {
        ...baseDocSpec.attrs,
        frontmatter: {},
      },
    },
    ...MdxProsemirrorNodeSpecs,
    ...customNodes,
    ...copiedNodes,
  } as Record<CustomNodes | MarkdownNodeType, NodeSpec>;
}
