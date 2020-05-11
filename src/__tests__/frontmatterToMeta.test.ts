import unified from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import * as inspect from 'unist-util-inspect';

import frontmatterToMeta from '../frontmatterToMeta';
import { RootNode, ImportNode, JsxNode, MdxNodeType } from '../mdxTypes';

function parse(source: string): RootNode {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(frontmatterToMeta, {});
  const ast = processor.parse(source) as any;
  processor.runSync(ast);
  return ast;
}

describe('frontmatterToMeta', () => {
  it('should convert simple frontmatter', () => {
    const doc = `---
title: Design System
---

# Design System

> Design system for NIBR`;
    const ast = parse(doc);
    expect(
      (ast.children.find(
        ({ type }) => type === MdxNodeType.Import
      ) as ImportNode).value
    ).toMatch(`import { Meta } from "@storybook/addon-docs/blocks";`);
    expect(inspect.noColor(ast)).toMatchInlineSnapshot(`
      "root[4] (1:1-7:25, 0-71) [meta={\\"title\\":\\"Design System\\"}]
      ├─ import: \\"import { Meta } from \\\\\\"@storybook/addon-docs/blocks\\\\\\";\\\\n\\"
      ├─ heading[1] (5:1-5:16, 30-45) [depth=1]
      │  └─ text: \\"Design System\\" (5:3-5:16, 32-45)
      ├─ blockquote[1] (7:1-7:25, 47-71)
      │  └─ paragraph[1] (7:3-7:25, 49-71)
      │     └─ text: \\"Design system for NIBR\\" (7:3-7:25, 49-71)
      └─ jsx: \\"\\\\n<Meta title=\\\\\\"Design System\\\\\\" />\\\\n\\""
    `);
  });

  it('should add frontmatter to existing import from same package', () => {
    const doc = `---
title: Colors
---
import { ColorPalette, ColorItem } from '@storybook/addon-docs/blocks';

# Colors

Lorem ipsum dolor sit amet...`;
    const ast = parse(doc);
    expect(
      (ast.children.find(
        ({ type }) => type === MdxNodeType.Import
      ) as ImportNode).value
    ).toMatchInlineSnapshot(`
      "
      import { ColorPalette, ColorItem, Meta } from '@storybook/addon-docs/blocks';
      "
    `);
  });

  it('should correctly handle JSON data types', () => {
    const doc = `---
title: Test page
truthyValue: true
falseyValue: false
tags: [MaterialDesign, Buttons, Colors]
nestedObject:
  hello: world
---

Lorem ipsum dolor sit amet...`;
    const ast = parse(doc);
    expect(
      (ast.children.find(({ type }) => type === MdxNodeType.Jsx) as JsxNode)
        .value
    ).toMatchInlineSnapshot(`
      "
      <Meta title=\\"Test page\\" truthyValue falseyValue={false} tags={[\\"MaterialDesign\\",\\"Buttons\\",\\"Colors\\"]} nestedObject={{\\"hello\\":\\"world\\"}} />
      "
    `);
  });
  it('should correctly handle JS references', () => {
    const doc = `---
title: Buttons
component: !<JsRef> 'Button'
---

import Button from '@material-ui/core/Button';

Lorem ipsum dolor sit amet...`;
    const ast = parse(doc);
    expect(
      (ast.children.find(({ type }) => type === MdxNodeType.Jsx) as JsxNode)
        .value
    ).toMatchInlineSnapshot(`
      "
      <Meta title=\\"Buttons\\" component={Button} />
      "
    `);
  });

  it('should not throw an error if there is no frontmatter', () => {
    const doc = `# Test page

Lorem ipsum dolor sit amet...`;
    const ast = parse(doc);
    expect(inspect.noColor(ast)).toMatchInlineSnapshot(`
      "root[2] (1:1-3:30, 0-42)
      ├─ heading[1] (1:1-1:12, 0-11) [depth=1]
      │  └─ text: \\"Test page\\" (1:3-1:12, 2-11)
      └─ paragraph[1] (3:1-3:30, 13-42)
         └─ text: \\"Lorem ipsum dolor sit amet...\\" (3:1-3:30, 13-42)"
    `);
  });
});
