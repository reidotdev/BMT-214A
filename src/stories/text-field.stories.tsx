import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, TextField } from "@/components/ui";
import { Cell, ForceState, Stack } from "./story-helpers";

const meta = {
  title: "Forms/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: "Full name",
    placeholder: "Alex Rivera",
    isDisabled: false,
    isRequired: false,
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    label: "Work email",
    type: "email",
    placeholder: "alex@studio.example",
    description: "We only use this to reply to your enquiry.",
  },
};

/**
 * Validation is React Aria's, not the browser's: `isInvalid` + `errorMessage`
 * wires `aria-describedby` and `aria-invalid` for you, and `data-invalid`
 * carries the red border.
 */
export const Invalid: Story = {
  args: {
    label: "Work email",
    type: "email",
    defaultValue: "not-an-email",
    isInvalid: true,
    errorMessage: "Enter a valid email address.",
  },
};

/** Native form validation, surfaced through the same `FieldError`. */
export const NativeValidation: Story = {
  render: () => (
    <form className="flex w-full max-w-sm flex-col gap-5">
      <TextField
        label="Work email"
        name="email"
        type="email"
        isRequired
        placeholder="alex@studio.example"
        errorMessage={({ validationDetails }) =>
          validationDetails.valueMissing
            ? "An email address is required."
            : "That does not look like an email address."
        }
      />
      <Button type="submit" size="sm" className="self-start">
        Submit
      </Button>
    </form>
  ),
};

export const States: Story = {
  render: () => (
    <Stack>
      <Cell label="rest">
        <TextField
          label="Full name"
          placeholder="Alex Rivera"
          className="w-full"
        />
      </Cell>
      <Cell label="hovered">
        <ForceState states={["hovered"]} selector="input">
          <TextField
            label="Full name"
            placeholder="Alex Rivera"
            className="w-full"
          />
        </ForceState>
      </Cell>
      <Cell label="focus-visible">
        <ForceState states={["focus-visible", "focused"]} selector="input">
          <TextField
            label="Full name"
            placeholder="Alex Rivera"
            className="w-full"
          />
        </ForceState>
      </Cell>
      <Cell label="filled">
        <TextField
          label="Full name"
          defaultValue="Alex Rivera"
          className="w-full"
        />
      </Cell>
      <Cell label="invalid">
        <TextField
          label="Full name"
          defaultValue="A"
          isInvalid
          errorMessage="Use at least two characters."
          className="w-full"
        />
      </Cell>
      <Cell label="disabled">
        <TextField
          label="Full name"
          defaultValue="Alex Rivera"
          isDisabled
          className="w-full"
        />
      </Cell>
      <Cell label="read only">
        <TextField
          label="Full name"
          defaultValue="Alex Rivera"
          isReadOnly
          className="w-full"
        />
      </Cell>
    </Stack>
  ),
};
