import { safeLoad, Type, Schema, DEFAULT_SAFE_SCHEMA } from 'js-yaml';

const JsRefYamlHandler = new Type('JsRef', {
  kind: 'scalar',
  predicate: (x) => x?.$type === 'JsRef',
  resolve(data) {
    return true;
  },
  construct(data) {
    return { $type: 'JsRef', value: data };
  },
  represent(reference) {
    return reference.value;
  },
});

const yamlSchema = new Schema({
  include: [DEFAULT_SAFE_SCHEMA],
  explicit: [JsRefYamlHandler],
});

export default function parseFrontmatter(source: string) {
  return safeLoad(source, { schema: yamlSchema });
}
