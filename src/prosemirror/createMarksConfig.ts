import { MarkSpec } from 'prosemirror-model';
import {
  MarkdownMarkType,
  schema as baseMarkdownSchema,
} from 'prosemirror-markdown';

export type PmMarkExtensions = Record<string, MarkSpec>;

const upstreamMarks = (() => {
  const result = {};
  Object.keys(baseMarkdownSchema.marks).forEach((markName) => {
    result[markName] = baseMarkdownSchema.marks[markName].spec;
  });
  return result;
})();

export function createMarksConfig<CustomMarks extends string>(
  customMarks: Record<CustomMarks, MarkSpec>
): Record<CustomMarks | MarkdownMarkType, MarkSpec> {
  return { ...upstreamMarks, ...customMarks } as Record<
    CustomMarks | MarkdownMarkType,
    MarkSpec
  >;
}
