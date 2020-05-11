export enum MdxNodeType {
  Root = 'root',
  Heading = 'heading',
  Paragraph = 'paragraph',
  ThematicBreak = 'thematicBreak',
  CodeBlock = 'code',
  List = 'list',
  ListItem = 'listItem',
  Blockquote = 'blockquote',
  Yaml = 'yaml',
  Link = 'link',
  Strong = 'strong',
  Em = 'emphasis',
  InlineCode = 'inlineCode',
  Import = 'import',
  Export = 'export',
  Jsx = 'jsx',
  Text = 'text',
}

export type RootNode = {
  type: MdxNodeType.Root;
  children: Array<MdxNode>;
  meta?: YamlValue;
};
export type TextNode = { type: MdxNodeType.Text; value: string };
export type HeadingNode = {
  type: MdxNodeType.Heading;
  depth: number;
  children: Array<MdxNode>;
};
export type ParagraphNode = {
  type: MdxNodeType.Paragraph;
  children: Array<MdxNode>;
};
export type BlockquoteNode = {
  type: MdxNodeType.Blockquote;
  children: Array<MdxNode>;
};
export type ListNode = {
  type: MdxNodeType.List;
  ordered: boolean;
  start: number | null;
  spread: boolean;
  children: Array<MdxNode>;
};
export type ListItemNode = {
  type: MdxNodeType.ListItem;
  /**
   * Does this list item have empty lines?
   *
   * Previously known as "loose" and is easier to Google that way.
   */
  spread: boolean;
  checked: null | boolean;
  children: Array<MdxNode>;
};
export type CodeBlockNode = {
  type: MdxNodeType.CodeBlock;
  lang: string;
  meta: string | null;
  value: string;
};
export type ThematicBreakNode = { type: MdxNodeType.ThematicBreak };
export type YamlNode = {
  type: MdxNodeType.Yaml;
  value: string;
};
export type LinkNode = {
  type: MdxNodeType.Link;
  title: null | string;
  url: string;
  children: Array<MdxNode>;
};
export type StrongNode = {
  type: MdxNodeType.Strong;
  children: Array<MdxNode>;
};
export type EmNode = { type: MdxNodeType.Em; children: Array<MdxNode> };
export type InlineCodeNode = {
  type: MdxNodeType.InlineCode;
  value: string;
};

export type ImportNode = { type: MdxNodeType.Import; value: string };
export type ExportNode = { type: MdxNodeType.Export; value: string };
export type JsxNode = { type: MdxNodeType.Jsx; value: string };

export type MdxNode =
  | RootNode
  | TextNode
  | YamlNode
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | ThematicBreakNode
  | BlockquoteNode
  | CodeBlockNode
  | LinkNode
  | StrongNode
  | EmNode
  | InlineCodeNode
  | ImportNode
  | ExportNode
  | JsxNode;

export type YamlValue<T = never> =
  | string
  | number
  | boolean
  | T
  | { [key: string]: YamlValue<T> }
  | Array<YamlValue<T>>;
