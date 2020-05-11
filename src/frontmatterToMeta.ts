/**
 * Convert YAML nodes to a JSX block, optionally adding the import for the JSX tag when necessary.
 *
 * Storybook.js requires metadata to be declared in a `<Meta/>` JSX tag, but it's easier to edit
 * when metadata is maintained as a YAML header at the top of the document. What to do?
 *
 * This file describes an [MDX plugin](https://mdxjs.com/advanced/plugins) that converts YAML
 * frontmatter into the format that Storybook prefers.
 *
 * @file
 */
import visit from 'unist-util-visit';
import { parse } from '@babel/parser';
import generator from '@babel/generator';
import * as t from '@babel/types';

import { RootNode, MdxNodeType, ImportNode, YamlValue } from './mdxTypes';

import parseFrontmatter from './parse/parseFrontmatter';
import remarkSmartFrontmatter, {
  DEFAULT_FRONTMATTER_OPTIONS,
} from './parse/remarkSmartFrontmatter';

/** Convert YAML frontmatter to Storybook `<Meta />` tag and update imports as necessary. */
export default function frontmatterToMeta({
  jsxTag = 'Meta',
  importPackage = '@storybook/addon-docs/blocks',
  frontmatterOptions = DEFAULT_FRONTMATTER_OPTIONS,
} = {}): (root: RootNode) => RootNode {
  // Apply the `remark-frontmatter` plugin. Typically I'd keep this separate and ask consumers to compose
  // the desired behavior, but this small change makes it much easier to consume as an MDX plugin.
  const smartTx = remarkSmartFrontmatter.call(this, { frontmatterOptions });

  return transform;

  function transform(root: RootNode): RootNode {
    smartTx(root);

    const frontmatter = root.meta;

    // If there's no frontmatter, there's nothing else to do here.
    if (!frontmatter) return;

    // Make sure that the desired JSX tag (usually `Meta`) is available in module scope.
    // There may be other imports from the same package, so if possible we want to simply add
    // the new identifier to the same import statement.
    let importAlreadyAdded = false;
    visit(root, MdxNodeType.Import, importVisitor);
    if (!importAlreadyAdded) {
      const importNode: ImportNode = {
        type: MdxNodeType.Import,
        // Need newlines here
        // @see https://stackoverflow.com/a/58672267/1385269
        // @see https://github.com/storybookjs/storybook/issues/8675
        value: `import { ${jsxTag} } from ${JSON.stringify(importPackage)};\n`,
      };
      root.children.unshift(importNode);
    }
    function importVisitor(node: ImportNode) {
      try {
        // Use Babel to find out what's actually being imported here.
        const ast = parse(node.value, {
          allowImportExportEverywhere: true,
        });
        const importStatements = ast.program.body;
        // Should never happen, but it's good to double-check and it makes TS happy anyways.
        if (!importStatements.length) return;
        // Iterate over import statements; there should only be one, but best to safeguard.
        importStatements.forEach((statement) => {
          // Make sure we're looking at the right type of node.
          if (!t.isImportDeclaration(statement)) return;
          // If this import statement doesn't refer to our target package, no point in continuing.
          if (statement.source.value !== importPackage) return;
          // By the time we get here, we already know that our import statement points to the correct package.
          // Now, we want to check whether the tag is already there, to avoid duplicate identifiers.
          if (statement.specifiers.some(specifierMatchesJsxTag)) {
            // We've found a package with the correct identifier (default `Meta`) and package location (default '@storybook/addon-docs/blocks').
            // Nothing else left to do here.
            importAlreadyAdded = true;
            return;
          }
          statement.specifiers.push(createJsxSpecifier());
          node.value = `\n${generator(ast).code}\n`;
          importAlreadyAdded = true;
        });
      } catch (error) {
        // If we can't parse the import statement, don't bother doing anything about it.
        console.error(error);
      }
    }

    // Append the generated (or updated) `<Meta />` block.
    root.children.push({
      type: MdxNodeType.Jsx,
      // Need newlines here https://stackoverflow.com/a/58672267/1385269
      value: `\n<${jsxTag} ${Object.entries(frontmatter)
        .map(([key, value]: [string, YamlValue]): string => {
          switch (typeof value) {
            case 'string':
              return `${key}=${JSON.stringify(value)}`;
            case 'boolean':
              if (value) {
                // Use usual JSX convention where bare attribute name means `true`.
                return key;
              }
              return `${key}={false}`;
            case 'object':
              if ('$type' in value && value.$type === 'JsRef') {
                // Bare JS reference; used for components
                return `${key}={${value.value}}`;
              }
              break;
            default:
              break;
          }
          return `${key}={${JSON.stringify(value)}}`;
        })
        .join(' ')} />\n`,
    });
    return root;
  }

  /** Create a Babel JSX Specifier with the tag we selected. */
  function createJsxSpecifier(): t.ImportSpecifier {
    return t.importSpecifier(t.identifier(jsxTag), t.identifier(jsxTag));
  }

  /** Predicate that tests whether the given import specifier provides the desired import (typically `<Meta />`). */
  function specifierMatchesJsxTag(
    specifier:
      | t.ImportSpecifier
      | t.ImportDefaultSpecifier
      | t.ImportNamespaceSpecifier
  ): boolean {
    return t.isImportSpecifier(specifier) && specifier.imported.name === jsxTag;
  }
}
