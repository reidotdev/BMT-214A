import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, Radio, RadioGroup } from "@/components/ui";
import { Cell, ForceState, Grid } from "./story-helpers";

const meta = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: {
    label: "Budget",
    isDisabled: false,
    // RadioGroup requires children; every story supplies its own in `render`,
    // which wins over args. This only satisfies the type.
    children: null,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="s">Under 10 000 €</Radio>
      <Radio value="m">10 000 – 30 000 €</Radio>
      <Radio value="l">Over 30 000 €</Radio>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    description: "A range is fine — it only sets the shape of the proposal.",
    defaultValue: "m",
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: "m" },
};

/** Radios are a single tab stop; arrow keys move the selection inside the group. */
export const Horizontal: Story = {
  args: { orientation: "horizontal", defaultValue: "m" },
  render: (args) => (
    <RadioGroup {...args} className="flex flex-col gap-2">
      <Radio value="s">Small</Radio>
      <Radio value="m">Medium</Radio>
      <Radio value="l">Large</Radio>
    </RadioGroup>
  ),
};

export const Validation: Story = {
  render: () => (
    <form className="flex w-full max-w-sm flex-col gap-5">
      <RadioGroup
        label="Budget"
        name="budget"
        isRequired
        errorMessage="Pick a budget range."
      >
        <Radio value="s">Under 10 000 €</Radio>
        <Radio value="m">10 000 – 30 000 €</Radio>
        <Radio value="l">Over 30 000 €</Radio>
      </RadioGroup>
      <Button type="submit" size="sm" className="self-start">
        Submit
      </Button>
    </form>
  ),
};

export const States: Story = {
  render: () => (
    <Grid cols={3}>
      <Cell label="rest">
        <RadioGroup aria-label="rest">
          <Radio value="a">Option</Radio>
        </RadioGroup>
      </Cell>
      <Cell label="hovered">
        <RadioGroup aria-label="hovered">
          <ForceState states={["hovered"]}>
            <Radio value="a">Option</Radio>
          </ForceState>
        </RadioGroup>
      </Cell>
      <Cell label="focus-visible">
        <RadioGroup aria-label="focus visible">
          <ForceState states={["focus-visible", "focused"]}>
            <Radio value="a">Option</Radio>
          </ForceState>
        </RadioGroup>
      </Cell>
      <Cell label="selected">
        <RadioGroup aria-label="selected" defaultValue="a">
          <Radio value="a">Option</Radio>
        </RadioGroup>
      </Cell>
      <Cell label="selected · hovered">
        <RadioGroup aria-label="selected hovered" defaultValue="a">
          <ForceState states={["hovered"]}>
            <Radio value="a">Option</Radio>
          </ForceState>
        </RadioGroup>
      </Cell>
      <Cell label="disabled">
        <RadioGroup aria-label="disabled" isDisabled defaultValue="a">
          <Radio value="a">Option</Radio>
        </RadioGroup>
      </Cell>
    </Grid>
  ),
};
