import createBuilder from '@ryaninvents/prosemirror-doc-tpl';
import createSchema from '../../prosemirror/createSchema';
import createMdxSerializer from '../createMdxSerializer';

const schema = createSchema({ nodes: {}, marks: {} });
const serializer = createMdxSerializer({ nodes: {}, marks: {} });
const pm = createBuilder(schema) as any;

describe('mdx-serializer', () => {
  it('should correctly serialize simple example', () => {
    expect(
      serializer.serialize(pm`
      <doc frontmatter=${{
        title: 'Example document',
        component: { $type: 'JsRef', value: 'Example' },
      }}>
        <mdx_import value=${"import Example from './Example';"} />
        <heading level=${2}>Component example</heading>
        <mdx_jsx value=${'<Example id="foo" />'} />
      </doc>
    `)
    ).toMatchInlineSnapshot(`
      "import Example from './Example';

      ## Component example

      <Example id=\\"foo\\" />
      "
    `);
  });
});
