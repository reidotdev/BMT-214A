import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Info, Plus, Settings } from "lucide-react";
import { Button, Tooltip, TooltipTrigger } from "@/components/ui";
import { Row } from "./story-helpers";

/**
 * Tooltips appear on hover *and* on keyboard focus, and never on touch — React
 * Aria's `TooltipTrigger` handles all of that. Never put essential information
 * in one, and never attach one to a non-focusable element.
 *
 * The tooltip portals to `<body>`, so use the Dark surface (not Side by side)
 * to check it against dark tokens.
 */
const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  args: { showArrow: true, children: "Tooltip" },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or tab to the button. `delay={0}` removes the warm-up for demo purposes. */
export const Playground: Story = {
  render: (args) => (
    <TooltipTrigger delay={0}>
      <Button size="icon" variant="ghost" aria-label="Add item">
        <Plus className="size-4" aria-hidden />
      </Button>
      <Tooltip {...args}>Add item</Tooltip>
    </TooltipTrigger>
  ),
};

/** Open on load, so the bubble and arrow can be reviewed statically. */
export const Open: Story = {
  render: (args) => (
    <TooltipTrigger isOpen>
      <Button size="icon" variant="ghost" aria-label="Settings">
        <Settings className="size-4" aria-hidden />
      </Button>
      <Tooltip {...args}>Settings</Tooltip>
    </TooltipTrigger>
  ),
};

export const WithoutArrow: Story = {
  args: { showArrow: false },
  render: Open.render,
};

/** The arrow rotates to match; each placement is worth a look. */
export const Placements: Story = {
  render: () => (
    <div className="grid w-full max-w-md grid-cols-2 justify-items-center gap-y-20 py-20">
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <TooltipTrigger key={placement} isOpen>
          <Button variant="outline" size="sm">
            {placement}
          </Button>
          <Tooltip placement={placement}>Tooltip on {placement}</Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  ),
};

/** Icon-only controls are the honest use: the tooltip repeats the accessible name. */
export const IconToolbar: Story = {
  render: () => (
    <Row>
      {[
        { icon: Plus, label: "Add" },
        { icon: Settings, label: "Settings" },
        { icon: Info, label: "About this project" },
      ].map(({ icon: Icon, label }) => (
        <TooltipTrigger key={label} delay={0}>
          <Button size="icon" variant="ghost" aria-label={label}>
            <Icon className="size-4" aria-hidden />
          </Button>
          <Tooltip>{label}</Tooltip>
        </TooltipTrigger>
      ))}
    </Row>
  ),
};
