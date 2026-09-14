import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  render: (args) => (
    <Tabs {...args} className="w-full max-w-lg">
      <TabList aria-label="Ways of working">
        <Tab id="discovery">Discovery</Tab>
        <Tab id="design">Design</Tab>
        <Tab id="build">Build</Tab>
      </TabList>
      <TabPanel id="discovery">
        A week of interviews and audits. You get a written brief, not a deck.
      </TabPanel>
      <TabPanel id="design">
        Tokens first, then screens. Everything lands in the design file and the
        code at the same time.
      </TabPanel>
      <TabPanel id="build">
        Next.js, Sanity, Vercel. Shipped behind a preview URL from day one.
      </TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Arrow keys move between tabs; the panel is a single tab stop after them. */
export const Playground: Story = {};

export const Vertical: Story = { args: { orientation: "vertical" } };

/** `defaultSelectedKey` picks the initial tab; `selectedKey` makes it controlled. */
export const PreselectedTab: Story = { args: { defaultSelectedKey: "build" } };

export const DisabledTab: Story = {
  render: (args) => (
    <Tabs {...args} className="w-full max-w-lg" disabledKeys={["build"]}>
      <TabList aria-label="Ways of working">
        <Tab id="discovery">Discovery</Tab>
        <Tab id="design">Design</Tab>
        <Tab id="build">Build</Tab>
      </TabList>
      <TabPanel id="discovery">Available now.</TabPanel>
      <TabPanel id="design">Available now.</TabPanel>
      <TabPanel id="build">Booked out.</TabPanel>
    </Tabs>
  ),
};

/**
 * Selection and the disabled state side by side. Hover and focus are live here
 * rather than pinned: a `TabList` renders a React Aria collection, so wrapping
 * its children in `ForceState` the way the other galleries do would break the
 * collection. Tab into the list and use the arrow keys instead.
 *
 * The unselected tabs are `--muted-foreground` on `--muted`, which is the
 * worst-case contrast pairing in the whole token set — check this story after
 * any re-theme (gotcha #7 in CLAUDE.md).
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Tabs className="w-fit" defaultSelectedKey="a">
        <TabList aria-label="Selected first">
          <Tab id="a">Selected</Tab>
          <Tab id="b">Rest</Tab>
          <Tab id="c" isDisabled>
            Disabled
          </Tab>
        </TabList>
      </Tabs>
    </div>
  ),
};
