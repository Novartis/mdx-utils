import { MdxNode, MdxNodeType, RootNode, JsxNode } from '../mdxTypes';
import { Node, Mark, Schema } from 'prosemirror-model';
import { MarkdownMarkType, MarkdownNodeType } from 'prosemirror-markdown';

function assertNever(x: never): never {
  /* istanbul ignore next */
  throw new Error(`Unexpected object: ${JSON.stringify(x)}`);
}

function nil() {
  /* istanbul ignore next */
  return null;
}

export default function createMdxConverter<
  N extends MarkdownNodeType,
  M extends MarkdownMarkType
>(
  schema: Schema<N, M>,
  {
    jsxToNode = nil,
  }: {
    jsxToNode?: (
      jsxNode: JsxNode,
      opts: { type: 'block' | 'inline' }
    ) => null | Node<Schema<N, M>>;
  } = {}
) {
  function mapChildren(
    children: Array<MdxNode>,
    parent: MdxNode | null
  ): Array<Node<typeof schema>> {
    return children.map((child) => mdxNodeToPm(child, parent)).flat(1);
  }

  function markChildren(
    children: Array<MdxNode>,
    parent: MdxNode | null,
    getMarks: (node: MdxNode) => Array<Mark<typeof schema>>
  ): Array<Node<typeof schema>> {
    return children
      .map((child) => {
        const pmNodes = mdxNodeToPm(child, parent);
        return pmNodes.map((pmNode) =>
          pmNode.mark([...pmNode.marks, ...getMarks(child)])
        );
      })
      .flat(1);
  }

  function jsxNodeToPm(
    node: JsxNode,
    parent: MdxNode | null
  ): Node<typeof schema> {
    const isInline = parent && parent.type !== MdxNodeType.Root;
    const customJsxNode = jsxToNode(node, {
      type: isInline ? 'inline' : 'block',
    });
    if (customJsxNode) return customJsxNode;
    const JsxNode = isInline
      ? schema.nodes.mdx_inline_jsx
      : schema.nodes.mdx_jsx;
    return JsxNode.create({ value: node.value });
  }

  function mdxNodeToPm(
    node: MdxNode,
    parent: MdxNode | null
  ): Array<Node<typeof schema>> {
    switch (node.type) {
      // ## Root node type
      //
      // Represents top-level document wrapper.
      case MdxNodeType.Root: {
        return [
          schema.nodes.doc.create(
            { frontmatter: node.meta },
            mapChildren(node.children, node)
          ),
        ];
      }

      // ## Plain text
      //
      // Text is a first-class node type in MDX, but a special case in ProseMirror.
      case MdxNodeType.Text:
        return [schema.text(node.value)];

      // ## Custom node types
      //
      // These represent our code and components in the DOM.
      case MdxNodeType.Import:
        return [schema.nodes.mdx_import.create({ value: node.value })];
      case MdxNodeType.Export:
        return [schema.nodes.mdx_export.create({ value: node.value })];
      case MdxNodeType.Jsx:
        return [jsxNodeToPm(node, parent)];

      // ## Markdown node types
      //
      // These elements remain first-class nodes in ProseMirror.
      case MdxNodeType.Heading:
        return [
          schema.nodes.heading.create(
            {
              level: node.depth,
            },
            mapChildren(node.children, node)
          ),
        ];
      case MdxNodeType.Paragraph:
        return [
          schema.nodes.paragraph.create({}, mapChildren(node.children, node)),
        ];
      case MdxNodeType.Blockquote:
        return [
          schema.nodes.blockquote.create({}, mapChildren(node.children, node)),
        ];
      case MdxNodeType.ThematicBreak:
        return [schema.nodes.horizontal_rule.create({})];
      case MdxNodeType.List:
        if (node.ordered)
          return [
            schema.nodes.ordered_list.create(
              { tight: !node.spread },
              mapChildren(node.children, node)
            ),
          ];
        return [
          schema.nodes.bullet_list.create(
            { tight: !node.spread },
            mapChildren(node.children, node)
          ),
        ];
      case MdxNodeType.ListItem:
        return [
          schema.nodes.list_item.create({}, mapChildren(node.children, node)),
        ];
      case MdxNodeType.CodeBlock:
        return [schema.nodes.code_block.create({}, schema.text(node.value))];

      // ## Mark types
      //
      // These elements are converted to "marks" on ProseMirror nodes.
      case MdxNodeType.Link:
        return markChildren(node.children, node, () => [
          schema.marks.link.create({ href: node.url, title: node.title }),
        ]);
      case MdxNodeType.Strong:
        return markChildren(node.children, node, () => [
          schema.marks.strong.create(),
        ]);
      case MdxNodeType.Em:
        return markChildren(node.children, node, () => [
          schema.marks.em.create(),
        ]);
      case MdxNodeType.InlineCode:
        return [schema.text(node.value).mark([schema.marks.code.create()])];

      // ## Special cases

      // Doesn't really matter what we do with YAML, since it will get filtered out before we get here.
      case MdxNodeType.Yaml:
        /* istanbul ignore next */
        return [];

      // If you get a type error on an `assertNever` call, it means there are cases
      // not covered in the `switch` above. The missing cases will display in the
      // error message.
      default:
        /* istanbul ignore next */
        assertNever(node);
    }
  }

  return function mdxAstToPm(mdxAst: RootNode): Node<Schema<N, M>> {
    return mdxNodeToPm(mdxAst, null)[0] as any;
  };
}
