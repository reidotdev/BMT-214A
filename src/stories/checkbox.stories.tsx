import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "@/components/ui";
import { Cell, ForceState, Grid } from "./story-helpers";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    children: "Subscribe to the newsletter",
    isDisabled: false,
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selected: Story = { args: { defaultSelected: true } };

/**
 * Indeterminate is a display state, not a value — RAC keeps it until the user
 * toggles. Use it for a "select all" that governs a partly-checked list.
 */
export const Indeterminate: Story = {
  args: { isIndeterminate: true, children: "Select all services" },
};

export const States: Story = {
  render: () => (
    <Grid cols={3}>
      <Cell label="rest">
        <Checkbox>Option</Checkbox>
      </Cell>
      <Cell label="hovered">
        <ForceState states={["hovered"]}>
          <Checkbox>Option</Checkbox>
        </ForceState>
      </Cell>
      <Cell label="focus-visible">
        <ForceState states={["focus-visible", "focused"]}>
          <Checkbox>Option</Checkbox>
        </ForceState>
      </Cell>
      <Cell label="selected">
        <Checkbox defaultSelected>Option</Checkbox>
      </Cell>
      <Cell label="selected · hovered">
        <ForceState states={["hovered"]}>
          <Checkbox defaultSelected>Option</Checkbox>
        </ForceState>
      </Cell>
      <Cell label="selected · focus-visible">
        <ForceState states={["focus-visible", "focused"]}>
          <Checkbox defaultSelected>Option</Checkbox>
        </ForceState>
      </Cell>
      <Cell label="indeterminate">
        <Checkbox isIndeterminate>Option</Checkbox>
      </Cell>
      <Cell label="disabled">
        <Checkbox isDisabled>Option</Checkbox>
      </Cell>
      <Cell label="disabled · selected">
        <Checkbox isDisabled defaultSelected>
          Option
        </Checkbox>
      </Cell>
    </Grid>
  ),
};

/** The whole row is the hit target, so long labels stay clickable and readable. */
export const LongLabel: Story = {
  render: () => (
    <div className="max-w-sm">
      <Checkbox>
        I agree to the terms of engagement and to being contacted about this
        enquiry.
      </Checkbox>
    </div>
  ),
};
