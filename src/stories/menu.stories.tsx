import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Copy, ExternalLink, Settings, Trash2 } from "lucide-react";
import { Button, Menu, MenuItem, MenuTrigger } from "@/components/ui";

/** `Menu` is generic over its item type, so the meta stays untyped. */
const meta: Meta = {
  title: "Navigation/Menu",
  component: Menu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

/** The popover portals to `<body>`, so check it with the surface set to Dark. */
export const Playground: Story = {
  render: () => (
    <MenuTrigger>
      <Button variant="outline">Actions</Button>
      <Menu onAction={() => {}}>
        <MenuItem id="copy">
          <Copy className="size-4" aria-hidden />
          Copy link
        </MenuItem>
        <MenuItem id="open">
          <ExternalLink className="size-4" aria-hidden />
          Open in new tab
        </MenuItem>
        <MenuItem id="settings">
          <Settings className="size-4" aria-hidden />
          Settings
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

/** Open on load, so the popover chrome can be reviewed without interacting. */
export const Open: Story = {
  render: () => (
    <MenuTrigger defaultOpen>
      <Button variant="outline">Actions</Button>
      <Menu onAction={() => {}}>
        <MenuItem id="copy">Copy link</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="archive">Archive</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <MenuTrigger defaultOpen>
      <Button variant="outline">Actions</Button>
      <Menu disabledKeys={["archive"]} onAction={() => {}}>
        <MenuItem id="copy">Copy link</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="archive">Archive — not available on this plan</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

/** Items that navigate: pass `href` and RAC renders an anchor with link semantics. */
export const LinkItems: Story = {
  render: () => (
    <MenuTrigger defaultOpen>
      <Button variant="outline">Resources</Button>
      <Menu>
        <MenuItem
          href="https://react-spectrum.adobe.com/react-aria/"
          target="_blank"
        >
          React Aria
        </MenuItem>
        <MenuItem href="https://tailwindcss.com" target="_blank">
          Tailwind CSS
        </MenuItem>
        <MenuItem href="https://www.sanity.io" target="_blank">
          Sanity
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

/** Destructive entries lean on the token, not a hardcoded red. */
export const Destructive: Story = {
  render: () => (
    <MenuTrigger defaultOpen>
      <Button variant="outline">Actions</Button>
      <Menu onAction={() => {}}>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem
          id="delete"
          className="text-destructive data-[focused]:bg-destructive data-[focused]:text-destructive-foreground"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete project
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

/** Placement comes from the popover, not the menu. */
export const Placement: Story = {
  render: () => (
    <MenuTrigger defaultOpen>
      <Button variant="outline">Opens to the right</Button>
      <Menu popoverProps={{ placement: "right top" }} onAction={() => {}}>
        <MenuItem id="a">First</MenuItem>
        <MenuItem id="b">Second</MenuItem>
        <MenuItem id="c">Third</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};
