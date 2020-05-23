# mdx-utils

## What's in this package?

This package contains utilities for working with MDX syntax.

Many of its utilities are only available as ES Modules, so you'll need to ensure your build step is configured to handle `import` statements.

### parseMdx

Parses an MDX document and its frontmatter into an AST.

```js
import parseMdx from '@novartis/mdx-utils/dist-src/parse/parseMdx';

console.log(
  parseMdx(
    `
---
title: Hello world!
---

This is an MDX document.

<MyCustomComponent />
`.trim()
  )
);
```

### createSchema

Create a custom [Prosemirror](https://prosemirror.net/) schema. This extends the Prosemirror Markdown schema with your custom elements, allowing its AST to represent your MDX document.

```js
import createSchema from '@novartis/mdx-utils/dist-src/prosemirror/createSchema';

const mySchema = createSchema({
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
```

### createMdxConverter

Creates a utility function that transforms an MDX syntax tree into a [Prosemirror](https://prosemirror.net/) syntax tree. This way, you can load it into a Prosemirror editor and allow rich-text editing with your custom components.

```js
import createMdxConverter from '@novartis/mdx-utils/dist-src/parse/mdxAstToPm';
import parseMdx from '@novartis/mdx-utils/dist-src/parse/parseMdx';

/** Custom callback that turns JSX into custom nodes. */
function jsxToNode(node) {
  if (node.value.startsWith('<MyCustomComponent')) {
    // In a real implementation, you would use Babel or another real parser to extract information.
    return schema.nodes.my_custom_component.create({ count: 1 });
  }
  return null;
}

const mdxAstToPm = createMdxConverter(schema, { jsxToNode });

function parseMdx(source) {
  const ast = parseMdx(source);
  return mdxAstToPm(ast);
}
```

### createMdxSerializer

Create a class that allows you to serialize a Prosemirror MDX document.

```js
import createMdxSerializer from '@novartis/mdx-utils/dist-src/serialize/createMdxSerializer';

// Minimal example; in a real application you would add your custom nodes here
const serializer = createMdxSerializer({ nodes: {}, marks: {} });

console.log(serializer.serialize(myPmDocument));
```

### frontmatterToMeta

Allows [Storybook](https://storybook.js.org/) MDX stories to be written using YAML frontmatter instead of importing the `<Meta/>` component.

```js
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');
const { frontmatterToMeta } = require('@novartis/mdx-utils');

module.exports = {
  // 1. register the docs panel (as opposed to '@storybook/addon-docs' which
  //    will configure everything with a preset)
  addons: ['@storybook/addon-docs/register'],
  // 2. manually configure webpack, since you're not using the preset
  webpackFinal: async (config) => {
    config.module.rules.push({
      // 2a. Load `.stories.mdx` / `.story.mdx` files as CSF and generate
      //     the docs page from the markdown
      test: /\.(stories|story)\.mdx$/,
      use: [
        {
          loader: 'babel-loader',
          // may or may not need this line depending on your app's setup
          options: {
            plugins: ['@babel/plugin-transform-react-jsx'],
          },
        },
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins: [frontmatterToMeta],
            compilers: [createCompiler({})],
          },
        },
      ],
    });
    // 2b. Run `source-loader` on story files to show their source code
    //     automatically in `DocsPage` or the `Source` doc block.
    config.module.rules.push({
      test: /\.(stories|story)\.[tj]sx?$/,
      loader: require.resolve('@storybook/source-loader'),
      exclude: [/node_modules/],
      enforce: 'pre',
    });
    return config;
  },
};
```

###
