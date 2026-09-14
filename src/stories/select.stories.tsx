import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, Select, SelectItem } from "@/components/ui";
import { Cell, ForceState, Stack } from "./story-helpers";

/**
 * `Select` is generic over its item type, so the meta is untyped — the controls
 * still come from the component's props via react-docgen.
 */
const meta: Meta = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "How did you hear about us?",
    placeholder: "Select an option",
  },
};

export default meta;
type Story = StoryObj;

/**
 * `textValue` is not optional here. `SelectItem` wraps its children in a
 * <span> alongside the check icon, so React Aria cannot infer the item's text
 * from a plain string child — without it, the trigger renders blank once
 * something is selected.
 */
const options = (
  <>
    <SelectItem id="referral" textValue="A referral">
      A referral
    </SelectItem>
    <SelectItem id="search" textValue="Search">
      Search
    </SelectItem>
    <SelectItem id="social" textValue="Social media">
      Social media
    </SelectItem>
    <SelectItem id="event" textValue="An event">
      An event
    </SelectItem>
    <SelectItem id="other" textValue="Something else">
      Something else
    </SelectItem>
  </>
);

/** Open the listbox to see the popover, the focus ring and the check mark. */
export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-xs">
      <Select {...args}>{options}</Select>
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    description: "It helps us know which channels are working.",
    defaultSelectedKey: "referral",
  },
  render: Playground.render,
};

/** The listbox is open on load so the popover styling can be reviewed statically. */
export const OpenListbox: Story = {
  args: { defaultOpen: true, defaultSelectedKey: "social" },
  render: Playground.render,
};

export const DisabledItems: Story = {
  args: { disabledKeys: ["event", "other"], defaultOpen: true },
  render: Playground.render,
};

/** Items can be driven from data with `items` + a render function. */
export const FromData: Story = {
  render: () => {
    const items = [
      { id: "fi", name: "Finland" },
      { id: "se", name: "Sweden" },
      { id: "no", name: "Norway" },
      { id: "dk", name: "Denmark" },
    ];
    return (
      <div className="w-full max-w-xs">
        <Select label="Country" items={items} defaultSelectedKey="fi">
          {(item: { id: string; name: string }) => (
            <SelectItem id={item.id} textValue={item.name}>
              {item.name}
            </SelectItem>
          )}
        </Select>
      </div>
    );
  },
};

export const Validation: Story = {
  render: () => (
    <form className="flex w-full max-w-xs flex-col gap-5">
      <Select
        label="How did you hear about us?"
        name="source"
        isRequired
        errorMessage="Pick one so we know where to invest."
      >
        {options}
      </Select>
      <Button type="submit" size="sm" className="self-start">
        Submit
      </Button>
    </form>
  ),
};

export const States: Story = {
  render: () => (
    <Stack className="max-w-xs">
      <Cell label="rest · placeholder" className="w-full">
        <Select label="Source" className="w-full">
          {options}
        </Select>
      </Cell>
      <Cell label="hovered" className="w-full">
        <ForceState states={["hovered"]} selector="button">
          <Select label="Source" className="w-full">
            {options}
          </Select>
        </ForceState>
      </Cell>
      <Cell label="focus-visible" className="w-full">
        <ForceState states={["focus-visible", "focused"]} selector="button">
          <Select label="Source" className="w-full">
            {options}
          </Select>
        </ForceState>
      </Cell>
      <Cell label="selected" className="w-full">
        <Select label="Source" defaultSelectedKey="referral" className="w-full">
          {options}
        </Select>
      </Cell>
      <Cell label="disabled" className="w-full">
        <Select
          label="Source"
          isDisabled
          defaultSelectedKey="referral"
          className="w-full"
        >
          {options}
        </Select>
      </Cell>
    </Stack>
  ),
};
