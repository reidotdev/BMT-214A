import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  DialogTitle,
  DialogTrigger,
  Modal,
  TextArea,
  TextField,
} from "@/components/ui";
import { Row } from "./story-helpers";

/**
 * `Modal` bundles the overlay, the modal box and the dialog. React Aria handles
 * the focus trap, the scroll lock, Escape and the outside-press dismiss.
 *
 * The overlay portals to `<body>`, so switch the surface toolbar to Dark (not
 * Side by side) to check it against dark tokens — see `.storybook/preview.tsx`
 * for why side-by-side can only theme one body.
 */
const meta = {
  title: "Overlays/Dialog",
  component: Modal,
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Start a project</Button>
      <Modal>
        {({ close }) => (
          <>
            <DialogTitle>Start a project</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Tell us roughly what you need. We reply within two working days.
            </p>
            <Row>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Send</Button>
            </Row>
          </>
        )}
      </Modal>
    </DialogTrigger>
  ),
};

/** Open on load, so the box can be reviewed without interacting. */
export const Open: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button>Start a project</Button>
      <Modal>
        {({ close }) => (
          <>
            <DialogTitle>Start a project</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Tell us roughly what you need. We reply within two working days.
            </p>
            <Row>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Send</Button>
            </Row>
          </>
        )}
      </Modal>
    </DialogTrigger>
  ),
};

/** Focus lands on the first field and cannot leave the dialog while it is open. */
export const WithForm: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button>Send an enquiry</Button>
      <Modal>
        {({ close }) => (
          <>
            <DialogTitle>Send an enquiry</DialogTitle>
            <TextField label="Your name" placeholder="Alex Rivera" autoFocus />
            <TextField
              label="Email"
              type="email"
              placeholder="alex@studio.example"
            />
            <TextArea label="What are you building?" rows={3} />
            <Row>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Send enquiry</Button>
            </Row>
          </>
        )}
      </Modal>
    </DialogTrigger>
  ),
};

/**
 * `isDismissable={false}` blocks Escape and outside press — for the rare dialog
 * that must be answered. Give it an explicit way out.
 */
export const Confirmation: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="destructive">Delete project</Button>
      <Modal isDismissable={false} role="alertdialog">
        {({ close }) => (
          <>
            <DialogTitle>Delete this project?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              This removes the project and every draft attached to it. It cannot
              be undone.
            </p>
            <Row>
              <Button variant="secondary" onPress={close}>
                Keep it
              </Button>
              <Button variant="destructive" onPress={close}>
                Delete
              </Button>
            </Row>
          </>
        )}
      </Modal>
    </DialogTrigger>
  ),
};
