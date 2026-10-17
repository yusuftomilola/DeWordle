import type { Meta, StoryObj } from "@storybook/react";
import { RewardsSkeleton } from "./RewardsSkeleton";
import { SkeletonToContent, withSkeletonTheme } from "./skeleton-story-helpers";

const meta = {
  title: "Skeletons/Rewards",
  component: RewardsSkeleton,
  decorators: [withSkeletonTheme],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof RewardsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The skeleton in its default loading state. */
export const Loading: Story = {};

/** The skeleton, then the loaded content that replaces it. */
export const SkeletonToLoadedContent: Story = {
  render: () => (
    <SkeletonToContent
      skeleton={<RewardsSkeleton />}
      content={
        <section aria-label="Rewards" className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <h2 className="text-lg font-semibold">Rewards</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {["Daily win", "3-day streak", "First share"].map((name) => (
              <li key={name} className="rounded-xl border border-current/20 p-5 text-center text-sm">
                {name}
              </li>
            ))}
          </ul>
          <button type="button" className="self-center rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white">
            Claim 200 points
          </button>
        </section>
      }
    />
  ),
};
