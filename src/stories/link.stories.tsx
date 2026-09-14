import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "@/components/ui";
import { Cell, ForceState, Grid, Row } from "./story-helpers";

const meta = {
  title: "Actions/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    children: "Read the case study",
    href: "#",
    variant: "default",
    isDisabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "muted", "button"],
    },
    isDisabled: { control: "boolean" },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Grid cols={3}>
      <Cell label="default">
        <Link href="#">Read the case study</Link>
      </Cell>
      <Cell label="muted">
        <Link href="#" variant="muted">
          Privacy policy
        </Link>
      </Cell>
      <Cell label="button">
        <Link href="#" variant="button">
          Start a project
        </Link>
      </Cell>
    </Grid>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["default", "muted", "button"] as const).map((variant) => (
        <Grid cols={4} key={variant}>
          <Cell label={`${variant} · rest`}>
            <Link href="#" variant={variant}>
              Link
            </Link>
          </Cell>
          <Cell label="hovered">
            <ForceState states={["hovered"]}>
              <Link href="#" variant={variant}>
                Link
              </Link>
            </ForceState>
          </Cell>
          <Cell label="focus-visible">
            <ForceState states={["focus-visible", "focused"]}>
              <Link href="#" variant={variant}>
                Link
              </Link>
            </ForceState>
          </Cell>
          <Cell label="disabled">
            <Link variant={variant} isDisabled>
              Link
            </Link>
          </Cell>
        </Grid>
      ))}
    </div>
  ),
};

/** In running text the link keeps the paragraph's rhythm — no layout shift on hover. */
export const InProse: Story = {
  render: () => (
    <p className="max-w-prose text-sm leading-relaxed">
      This boilerplate ships accessible components and a swappable token layer.
      See <Link href="#">what it includes</Link>, or read the{" "}
      <Link href="#" variant="muted">
        design decisions
      </Link>{" "}
      first.
    </p>
  ),
};

/** `target="_blank"` and `download` pass straight through to the anchor. */
export const External: Story = {
  render: () => (
    <Row>
      <Link
        href="https://react-spectrum.adobe.com/react-aria/"
        target="_blank"
        rel="noreferrer"
      >
        React Aria docs
      </Link>
      <Link href="#" variant="muted" isDisabled>
        Disabled link
      </Link>
    </Row>
  ),
};
