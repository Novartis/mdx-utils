import createMdxConverter from '../mdxAstToPm';
import createSchema from '../../prosemirror/createSchema';
import { Node } from 'prosemirror-model';
import { MdxNodeType, JsxNode } from '../../mdxTypes';
import parseMdxToAst from '../parseMdx';

const schema = createSchema({
  nodes: {
    my_custom_component: {
      atom: true,
      attrs: {
        count: {},
      },
      toDOM() {
        return ['div', { class: 'my_custom_component' }];
      },
    },
  },
  marks: {},
});
const mdxAstToPm = createMdxConverter(schema, { jsxToNode });
function parseMdx(source: string) {
  const ast = parseMdxToAst(source);
  return mdxAstToPm(ast);
}

/** Custom callback that turns JSX into custom nodes. */
function jsxToNode(node: JsxNode): null | Node<typeof schema> {
  if (node.value.startsWith('<MyCustomComponent')) {
    // In a real implementation, you would use Babel or another real parser to extract information.
    return schema.nodes.my_custom_component.create({ count: 1 });
  }
  return null;
}

describe('mdxAstToPm', () => {
  it('should parse an example document with YAML', () => {
    const pmTree = parseMdx(`---
title: Design System
---

# Design System

> Design system for NIBR`);
    expect(pmTree.attrs.frontmatter).toEqual({ title: 'Design System' });

    pmTree.forEach((node) => {
      // Triple-hyphen should parse as YAML delimeter, not <hr>
      expect(node.type.name === MdxNodeType.ThematicBreak).toBeFalsy();
    });
  });

  it('should parse block JSX nodes', () => {
    const ast = parseMdx(`---
title: Example JSX
---
import Button from '@material-ui/core/Button';

<Button color="primary">Click me</Button>

`);
    const children = Array.from({ length: ast.childCount }, (_, i) =>
      ast.child(i)
    );
    expect(children.find(({ type }) => type.name === 'mdx_import').toJSON())
      .toMatchInlineSnapshot(`
      Object {
        "attrs": Object {
          "value": "import Button from '@material-ui/core/Button';",
        },
        "type": "mdx_import",
      }
    `);
    expect(children.find(({ type }) => type.name === 'mdx_jsx').toJSON())
      .toMatchInlineSnapshot(`
      Object {
        "attrs": Object {
          "value": "<Button color=\\"primary\\">Click me</Button>",
        },
        "type": "mdx_jsx",
      }
    `);
  });

  it('should use custom parser for provided JSX nodes', () => {
    const ast = parseMdx(`---
title: Custom components
---

<MyCustomComponent prop="value" />

`);
    const children = Array.from({ length: ast.childCount }, (_, i) =>
      ast.child(i)
    );
    expect(children.find((node) => node.type.name === 'my_custom_component'))
      .toMatchInlineSnapshot(`
      Object {
        "attrs": Object {
          "count": 1,
        },
        "type": "my_custom_component",
      }
    `);
  });

  it('should parse most node types', () => {
    const ast = parseMdx(`---
title: MDX nodes
---

import CustomComponent from './CustomComponent';

# MDX nodes

Here is an example of many different MDX elements. You can have **bold** text, _italic_ text, \`code\`, and [links](https://novartis.com).

Here's a list:

- First item
- Second item
- Third item
    1. This one has a nested ordered list
    2. Should parse correctly

> Sometimes you like to use blockquotes as well

----

## More examples

<CustomComponent prop="value" />

export function hello() {
  return 'world';
}

\`\`\`js
// Code sample
\`\`\`

`);
    expect(ast).toMatchSnapshot();
  });
});
