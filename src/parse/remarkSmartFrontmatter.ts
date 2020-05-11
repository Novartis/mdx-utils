import visit from 'unist-util-visit';
import remarkFrontmatter from 'remark-frontmatter';

import {
  RootNode,
  YamlNode,
  MdxNodeType,
  YamlValue,
  MdxNode,
} from '../mdxTypes';
import parseFrontmatter from './parseFrontmatter';

export function obtainFrontmatter<T>(
  root: RootNode,
  {
    parseYaml = parseFrontmatter,
  }: { parseYaml?: (source: string) => YamlValue<T> } = {}
): YamlValue<T> | null {
  let frontmatter = null;
  visit(root, MdxNodeType.Yaml, (node: YamlNode) => {
    let source = node.value;
    if (typeof source !== 'string') return;

    const value = parseYaml(source);
    if (!frontmatter) frontmatter = {};
    Object.assign(frontmatter, value);
  });
  return frontmatter;
}

/** Removes all top-level YAML nodes from the given document. */
function stripYaml(root: RootNode) {
  root.children = root.children.filter(
    (node: MdxNode) => node.type !== MdxNodeType.Yaml
  );
}

/**
 * Default options passed to the `remark-frontmatter` package.
 */
export const DEFAULT_FRONTMATTER_OPTIONS = ['yaml'];

export default function remarkSmartFrontmatter({
  frontmatterOptions = DEFAULT_FRONTMATTER_OPTIONS,
}: { frontmatterOptions?: any } = {}) {
  remarkFrontmatter.call(this, frontmatterOptions);

  return function transform(root: RootNode) {
    const frontmatter: YamlValue = obtainFrontmatter(root);
    if (frontmatter) root.meta = frontmatter;

    stripYaml(root);
  };
}
