import type { Meta, StoryObj } from "@storybook/react";
import { SessionsSkeleton } from "./SessionsSkeleton";
import { SkeletonToContent, withSkeletonTheme } from "./skeleton-story-helpers";

const meta = {
  title: "Skeletons/Sessions",
  component: SessionsSkeleton,
  decorators: [withSkeletonTheme],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof SessionsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The skeleton in its default loading state. */
export const Loading: Story = {};

/** The skeleton, then the loaded content that replaces it. */
export const SkeletonToLoadedContent: Story = {
  render: () => (
    <SkeletonToContent
      skeleton={<SessionsSkeleton />}
      content={
        <section aria-label="Sessions" className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          {[["2026-03-10", "Won in 4"], ["2026-03-09", "Won in 3"], ["2026-03-08", "Lost"]].map(([day, result]) => (
            <div key={day} className="flex justify-between rounded-xl border border-current/20 p-4 text-sm">
              <span>{day}</span>
              <span>{result}</span>
            </div>
          ))}
        </section>
      }
    />
  ),
};
