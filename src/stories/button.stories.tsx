import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Cell, ForceState, Grid, Row } from "./story-helpers";

const meta = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Get in touch",
    variant: "primary",
    size: "md",
    isDisabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "icon"] },
    isDisabled: { control: "boolean" },
    isPending: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default. Use the controls panel to try every prop combination. */
export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Grid cols={3}>
      <Cell label="primary">
        <Button variant="primary">Primary</Button>
      </Cell>
      <Cell label="secondary">
        <Button variant="secondary">Secondary</Button>
      </Cell>
      <Cell label="outline">
        <Button variant="outline">Outline</Button>
      </Cell>
      <Cell label="ghost">
        <Button variant="ghost">Ghost</Button>
      </Cell>
      <Cell label="destructive">
        <Button variant="destructive">Destructive</Button>
      </Cell>
    </Grid>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Row>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus className="size-4" aria-hidden />
      </Button>
    </Row>
  ),
};

/**
 * React Aria interaction states, pinned on so they can be compared at a glance.
 * Hover, press and focus are otherwise only reachable by interacting — see
 * `ForceState` in `story-helpers.tsx`.
 *
 * The `focus-visible` cells are worth a second look on every re-theme: the ring
 * they paint is the one thing in the whole set that has already failed silently
 * once (`focusRing` in `src/components/ui/styles.ts`, gotcha #1 in CLAUDE.md).
 * If those cells stop differing from `rest`, the ring is gone site-wide.
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["primary", "secondary", "outline", "destructive"] as const).map(
        (variant) => (
          <Grid cols={4} key={variant}>
            <Cell label={`${variant} · rest`}>
              <Button variant={variant}>Button</Button>
            </Cell>
            <Cell label="hovered">
              <ForceState states={["hovered"]}>
                <Button variant={variant}>Button</Button>
              </ForceState>
            </Cell>
            <Cell label="pressed">
              <ForceState states={["pressed", "hovered"]}>
                <Button variant={variant}>Button</Button>
              </ForceState>
            </Cell>
            <Cell label="focus-visible">
              <ForceState states={["focus-visible", "focused"]}>
                <Button variant={variant}>Button</Button>
              </ForceState>
            </Cell>
          </Grid>
        ),
      )}
      <Grid cols={4}>
        <Cell label="disabled">
          <Button isDisabled>Button</Button>
        </Cell>
        <Cell label="disabled · outline">
          <Button variant="outline" isDisabled>
            Button
          </Button>
        </Cell>
        <Cell label="pending">
          <Button isPending>Button</Button>
        </Cell>
      </Grid>
    </div>
  ),
};

/** Icons sit in the flow; `gap` is part of each size, so nothing extra is needed. */
export const WithIcons: Story = {
  render: () => (
    <Row>
      <Button>
        <Plus className="size-4" aria-hidden />
        New project
      </Button>
      <Button variant="outline">
        Continue
        <ArrowRight className="size-4" aria-hidden />
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2 className="size-3.5" aria-hidden />
        Delete
      </Button>
      <Button size="icon" variant="ghost" aria-label="Add item">
        <Plus className="size-4" aria-hidden />
      </Button>
    </Row>
  ),
};
