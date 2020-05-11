import unified from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkSmartFrontmatter from './remarkSmartFrontmatter';
import { RootNode } from '../mdxTypes';

export default function parseMdxToAst(mdx: string): RootNode {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkSmartFrontmatter, {});
  const ast: RootNode = processor.parse(mdx) as any;
  processor.runSync(ast);

  return ast;
}
