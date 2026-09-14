import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextArea } from "@/components/ui";
import { Cell, ForceState, Stack } from "./story-helpers";

const meta = {
  title: "Forms/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  args: {
    label: "Tell us about the project",
    placeholder: "What are you building, and by when?",
    rows: 4,
    isDisabled: false,
  },
  argTypes: {
    rows: { control: { type: "number", min: 2, max: 12 } },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    description: "A couple of sentences is plenty — we will follow up.",
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "Hi",
    isInvalid: true,
    errorMessage: "Please give us a little more detail.",
  },
};

/** The box is `resize-y`: the reader can grow it, but never break the column. */
export const Sizes: Story = {
  render: () => (
    <Stack className="max-w-md">
      <TextArea label="Two rows" rows={2} placeholder="Short note" />
      <TextArea label="Six rows" rows={6} placeholder="A longer brief" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack className="max-w-md">
      <Cell label="rest">
        <TextArea
          label="Brief"
          rows={3}
          placeholder="What are you building?"
          className="w-full"
        />
      </Cell>
      <Cell label="hovered">
        <ForceState states={["hovered"]} selector="textarea">
          <TextArea
            label="Brief"
            rows={3}
            placeholder="What are you building?"
            className="w-full"
          />
        </ForceState>
      </Cell>
      <Cell label="focus-visible">
        <ForceState states={["focus-visible", "focused"]} selector="textarea">
          <TextArea
            label="Brief"
            rows={3}
            placeholder="What are you building?"
            className="w-full"
          />
        </ForceState>
      </Cell>
      <Cell label="invalid">
        <TextArea
          label="Brief"
          rows={3}
          defaultValue="Hi"
          isInvalid
          errorMessage="Please give us a little more detail."
          className="w-full"
        />
      </Cell>
      <Cell label="disabled">
        <TextArea
          label="Brief"
          rows={3}
          defaultValue="Locked"
          isDisabled
          className="w-full"
        />
      </Cell>
    </Stack>
  ),
};
