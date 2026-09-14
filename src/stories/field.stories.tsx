import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input, TextField as AriaTextField } from "react-aria-components";
import { Button, Description, FieldError, Label } from "@/components/ui";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/utils";

/**
 * `Label`, `Description` and `FieldError` are the shared field furniture that
 * TextField, TextArea, Select and RadioGroup all compose from. Reach for them
 * directly when you build a *new* field component — that is the whole reason
 * they are exported.
 *
 * They read their wiring (`id`, `aria-describedby`, validation) from whatever
 * React Aria field context they sit inside, so they must be rendered inside a
 * RAC field — never standalone.
 *
 * Note the inputs below borrow `focusRing` from `src/components/ui/styles.ts`
 * rather than spelling the outline utilities out. Hand-rolling them is how the
 * ring silently stops painting — see gotcha #1 in CLAUDE.md.
 */
const meta = {
  title: "Forms/Field primitives",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

const input = cn(
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
  "placeholder:text-muted-foreground",
  focusRing,
);

/** A hand-rolled field, assembled from the primitives + a bare RAC `Input`. */
export const ComposedField: Story = {
  render: () => (
    <AriaTextField className="flex w-full max-w-sm flex-col gap-1.5">
      <Label>Invoice reference</Label>
      <Input className={input} />
      <Description>Printed on the top right of the invoice.</Description>
    </AriaTextField>
  ),
};

/** `FieldError` renders only when the surrounding field is invalid. */
export const WithError: Story = {
  render: () => (
    <AriaTextField
      className="flex w-full max-w-sm flex-col gap-1.5"
      isInvalid
      defaultValue="12"
    >
      <Label>Invoice reference</Label>
      <Input className={cn(input, "border-destructive")} />
      <Description>Printed on the top right of the invoice.</Description>
      <FieldError>Reference must be eight digits.</FieldError>
    </AriaTextField>
  ),
};

/** The label dims with the field; the association survives. */
export const Disabled: Story = {
  render: () => (
    <AriaTextField className="flex w-full max-w-sm flex-col gap-1.5" isDisabled>
      <Label>Invoice reference</Label>
      <Input className={cn(input, "opacity-50")} />
      <Description>Locked while the invoice is in review.</Description>
    </AriaTextField>
  ),
};

/** Function `errorMessage` reads the browser's own ValidityState. */
export const NativeValidity: Story = {
  render: () => (
    <form className="flex w-full max-w-sm flex-col gap-5">
      <AriaTextField
        className="flex flex-col gap-1.5"
        name="ref"
        isRequired
        pattern="\d{8}"
      >
        <Label>Invoice reference</Label>
        <Input className={cn(input, "data-[invalid]:border-destructive")} />
        <FieldError>
          {({ validationDetails }) =>
            validationDetails.valueMissing
              ? "A reference is required."
              : "Use exactly eight digits."
          }
        </FieldError>
      </AriaTextField>
      <Button type="submit" size="sm" className="self-start">
        Submit
      </Button>
    </form>
  ),
};
