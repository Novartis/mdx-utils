// Type definitions for prosemirror-markdown 1.0
// Project: https://github.com/ProseMirror/prosemirror-markdown
// Definitions by: Bradley Ayers <https://github.com/bradleyayers>
//                 David Hahn <https://github.com/davidka>
//                 Tim Baumann <https://github.com/timjb>
//                 Patrick Simmelbauer <https://github.com/patsimm>
//                 Ifiokj Jr. <https://github.com/ifiokjr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3
declare module 'prosemirror-markdown' {
  import MarkdownIt = require('markdown-it');
  import Token = require('markdown-it/lib/token');
  import {
    Fragment,
    Mark,
    Node as ProsemirrorNode,
    Schema,
  } from 'prosemirror-model';

  export interface TokenConfig {
    /**
     * This token maps to a single node, whose type can be looked up
     * in the schema under the given name. Exactly one of `node`,
     * `block`, or `mark` must be set.
     */
    node?: string;

    /**
     * This token also comes in `_open` and `_close` variants, but
     * should add a mark (named by the value) to its content, rather
     * than wrapping it in a node.
     */
    mark?: string;

    /**
     * This token comes in `_open` and `_close` variants (which are
     * appended to the base token name provides a the object
     * property), and wraps a block of content. The block should be
     * wrapped in a node of the type named to by the property's
     * value.
     */
    block?: string;

    /**
     * Attributes for the node or mark. When `getAttrs` is provided,
     * it takes precedence.
     */
    attrs?: Record<string, any>;

    /**
     * A function used to compute the attributes for the node or mark
     * that takes a [markdown-it
     * token](https://markdown-it.github.io/markdown-it/#Token) and
     * returns an attribute object.
     */
    getAttrs?(token: Token): Record<string, any>;

    /**
     * When true, ignore content for the matched token.
     */
    ignore?: boolean;
  }

  /**
   * A configuration of a Markdown parser. Such a parser uses
   * [markdown-it](https://github.com/markdown-it/markdown-it) to
   * tokenize a file, and then runs the custom rules it is given over
   * the tokens to create a ProseMirror document tree.
   */
  export class MarkdownParser<S extends MarkdownSchema = MarkdownSchema> {
    /**
     * Create a parser with the given configuration. You can configure
     * the markdown-it parser to parse the dialect you want, and provide
     * a description of the ProseMirror entities those tokens map to in
     * the `tokens` object, which maps token names to descriptions of
     * what to do with them. Such a description is an object, and may
     * have the following properties:
     *
     * **`node`**`: ?string`
     * : This token maps to a single node, whose type can be looked up
     * in the schema under the given name. Exactly one of `node`,
     * `block`, or `mark` must be set.
     *
     * **`block`**`: ?string`
     * : This token comes in `_open` and `_close` variants (which are
     * appended to the base token name provides a the object
     * property), and wraps a block of content. The block should be
     * wrapped in a node of the type named to by the property's
     * value.
     *
     * **`mark`**`: ?string`
     * : This token also comes in `_open` and `_close` variants, but
     * should add a mark (named by the value) to its content, rather
     * than wrapping it in a node.
     *
     * **`attrs`**`: ?Object`
     * : Attributes for the node or mark. When `getAttrs` is provided,
     * it takes precedence.
     *
     * **`getAttrs`**`: ?(MarkdownToken) → Object`
     * : A function used to compute the attributes for the node or mark
     * that takes a [markdown-it
     * token](https://markdown-it.github.io/markdown-it/#Token) and
     * returns an attribute object.
     *
     * **`ignore`**`: ?bool`
     * : When true, ignore content for the matched token.
     */
    constructor(
      schema: S,
      tokenizer: MarkdownIt,
      tokens: { [key: string]: TokenConfig }
    );
    /**
     * The value of the `tokens` object used to construct
     * this parser. Can be useful to copy and modify to base other
     * parsers on.
     */
    tokens: { [key: string]: Token };
    /**
     * Parse a string as [CommonMark](http://commonmark.org/) markup,
     * and create a ProseMirror document as prescribed by this parser's
     * rules.
     */
    parse(text: string): ProsemirrorNode<S>;
  }
  /**
   * A parser parsing unextended [CommonMark](http://commonmark.org/),
   * without inline HTML, and producing a document in the basic schema.
   */
  export let defaultMarkdownParser: MarkdownParser;

  export type MarkSerializerMethod<
    N extends string = MarkdownNodeType,
    M extends string = MarkdownMarkType
  > = (
    state: MarkdownSerializerState<N, M>,
    mark: Mark<Schema<N, M>>,
    parent: Fragment<Schema<N, M>>,
    index: number
  ) => void;

  export interface MarkSerializerConfig<
    N extends string = MarkdownNodeType,
    M extends string = MarkdownMarkType
  > {
    open: string | MarkSerializerMethod<N, M>;
    close: string | MarkSerializerMethod<N, M>;
    mixable?: boolean;
    expelEnclosingWhitespace?: boolean;
    escape?: boolean;
  }
  /**
   * A specification for serializing a ProseMirror document as
   * Markdown/CommonMark text.
   */
  export class MarkdownSerializer<
    N extends string = MarkdownNodeType,
    M extends string = MarkdownMarkType
  > {
    constructor(
      nodes: Record<
        N,
        (
          state: MarkdownSerializerState<N, M>,
          node: ProsemirrorNode<Schema<N, M>>,
          parent: ProsemirrorNode<Schema<N, M>>,
          index: number
        ) => void
      >,
      marks: Record<M, MarkSerializerConfig>
    );
    /**
     * The node serializer
     * functions for this serializer.
     */
    nodes: {
      [name: string]: (
        p1: MarkdownSerializerState<N, M>,
        p2: ProsemirrorNode<Schema<N, M>>
      ) => void;
    };
    /**
     * The mark serializer info.
     */
    marks: { [key: string]: any };
    /**
     * Serialize the content of the given node to
     * [CommonMark](http://commonmark.org/).
     */
    serialize(
      content: ProsemirrorNode<Schema<N, M>>,
      options?: { [key: string]: any }
    ): string;
  }
  /**
   * A serializer for the [basic schema](#schema).
   */
  export let defaultMarkdownSerializer: MarkdownSerializer;
  /**
   * This is an object used to track state and expose
   * methods related to markdown serialization. Instances are passed to
   * node and mark serialization methods (see `toMarkdown`).
   */
  export class MarkdownSerializerState<
    N extends string = MarkdownNodeType,
    M extends string = MarkdownMarkType
  > {
    /**
     * The options passed to the serializer.
     */
    options: { tightLists?: boolean | null };
    /**
     * Render a block, prefixing each line with `delim`, and the first
     * line in `firstDelim`. `node` should be the node that is closed at
     * the end of the block, and `f` is a function that renders the
     * content of the block.
     */
    wrapBlock(
      delim: string,
      firstDelim: string | undefined,
      node: ProsemirrorNode<Schema<N, M>>,
      f: () => void
    ): void;
    /**
     * Ensure the current content ends with a newline.
     */
    ensureNewLine(): void;
    /**
     * Prepare the state for writing output (closing closed paragraphs,
     * adding delimiters, and so on), and then optionally add content
     * (unescaped) to the output.
     */
    write(content?: string): void;
    /**
     * Close the block for the given node.
     */
    closeBlock(node: ProsemirrorNode<Schema<N, M>>): void;
    /**
     * Add the given text to the document. When escape is not `false`,
     * it will be escaped.
     */
    text(text: string, escape?: boolean): void;

    /**
     * Render the given node as a block.
     */
    render(node: ProsemirrorNode<Schema<N, M>>): void;

    /**
     * Render the contents of `parent` as block nodes.
     */
    renderContent(parent: ProsemirrorNode<Schema<N, M>>): void;

    /**
     * Render the contents of `parent` as inline content.
     */
    renderInline(parent: ProsemirrorNode<Schema<N, M>>): void;

    /**
     * Render a node's content as a list. `delim` should be the extra
     * indentation added to all lines except the first in an item,
     * `firstDelim` is a function going from an item index to a
     * delimiter for the first line of the item.
     */
    renderList(
      node: ProsemirrorNode<Schema<N, M>>,
      delim: string,
      firstDelim: (p: number) => string
    ): void;

    /**
     * Escape the given string so that it can safely appear in Markdown
     * content. If `startOfLine` is true, also escape characters that
     * has special meaning only at the start of the line.
     */
    esc(str: string, startOfLine?: boolean): string;

    /**
     * Repeat the given string `n` times.
     */
    repeat(str: string, n: number): string;

    /**
     * Get leading and trailing whitespace from a string. Values of
     * leading or trailing property of the return object will be undefined
     * if there is no match.
     */
    getEnclosingWhitespace(
      text: string
    ): { leading?: string | null; trailing?: string | null };

    /**
     * Wraps the passed string in a string of its own
     */
    quote(str: string): string;
  }

  export type MarkdownNodeType =
    | 'doc'
    | 'paragraph'
    | 'blockquote'
    | 'horizontal_rule'
    | 'heading'
    | 'code_block'
    | 'ordered_list'
    | 'bullet_list'
    | 'list_item'
    | 'text'
    | 'image'
    | 'hard_break';

  export type MarkdownMarkType = 'em' | 'strong' | 'link' | 'code';

  export type MarkdownSchema<
    N extends MarkdownNodeType = MarkdownNodeType,
    M extends MarkdownMarkType = MarkdownMarkType
  > = Schema<N, M>;

  export let schema: MarkdownSchema;
}
