"use client";

import { Bell, ChevronDown } from "lucide-react";
import {
  Button,
  Checkbox,
  DialogTitle,
  DialogTrigger,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui";

/**
 * Live demo of the pre-styled core components. Delete this file per project —
 * it exists only to prove the stack works out of the box.
 */
export function Showcase() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <TooltipTrigger>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <Tooltip>Notifications</Tooltip>
        </TooltipTrigger>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <TextField label="Email" placeholder="you@example.com" type="email" />
        <Select label="Framework" defaultSelectedKey="next">
          <SelectItem id="next">Next.js</SelectItem>
          <SelectItem id="remix">Remix</SelectItem>
          <SelectItem id="astro">Astro</SelectItem>
        </Select>
      </section>

      <section className="flex flex-wrap items-start gap-10">
        <RadioGroup label="Plan" defaultValue="pro">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
        <div className="flex flex-col gap-2">
          <Checkbox defaultSelected>Subscribe to updates</Checkbox>
          <Checkbox>Accept terms</Checkbox>
        </div>
        <MenuTrigger>
          <Button variant="outline">
            Options <ChevronDown className="size-4" />
          </Button>
          <Menu>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Delete</MenuItem>
          </Menu>
        </MenuTrigger>
      </section>

      <section>
        <Tabs>
          <TabList aria-label="Demo tabs">
            <Tab id="overview">Overview</Tab>
            <Tab id="specs">Specs</Tab>
            <Tab id="reviews">Reviews</Tab>
          </TabList>
          <TabPanel id="overview" className="pt-4 text-muted-foreground">
            Accessible tabs from React Aria, styled with design tokens.
          </TabPanel>
          <TabPanel id="specs" className="pt-4 text-muted-foreground">
            Keyboard-navigable, ARIA-correct, restyle-friendly.
          </TabPanel>
          <TabPanel id="reviews" className="pt-4 text-muted-foreground">
            Swap the visual layer without touching behavior.
          </TabPanel>
        </Tabs>
      </section>

      <section>
        <DialogTrigger>
          <Button>Open dialog</Button>
          <Modal>
            <DialogTitle>Boilerplate ready</DialogTitle>
            <p className="text-sm text-muted-foreground">
              A modal from React Aria — focus-trapped, dismissable, animated.
            </p>
            <div className="flex justify-end gap-2">
              <Button slot="close" variant="ghost">
                Cancel
              </Button>
              <Button slot="close">Confirm</Button>
            </div>
          </Modal>
        </DialogTrigger>
      </section>
    </div>
  );
}
