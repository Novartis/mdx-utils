import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model';
import { MarkdownNodeType, MarkdownMarkType } from 'prosemirror-markdown';
import { createMarksConfig } from './createMarksConfig';
import { createNodesConfig } from './createNodesConfig';

export default function createSchema<
  CustomNodes extends string,
  CustomMarks extends string
>({
  nodes,
  marks,
}: {
  nodes: Record<CustomNodes, NodeSpec>;
  marks: Record<CustomMarks, MarkSpec>;
}): Schema<CustomNodes | MarkdownNodeType, CustomMarks | MarkdownMarkType> {
  return new Schema<
    CustomNodes | MarkdownNodeType,
    CustomMarks | MarkdownMarkType
  >({
    nodes: createNodesConfig(nodes),
    marks: createMarksConfig(marks),
  });
}
