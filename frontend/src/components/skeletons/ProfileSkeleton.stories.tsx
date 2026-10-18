import type { Meta, StoryObj } from "@storybook/react";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { SkeletonToContent, withSkeletonTheme } from "./skeleton-story-helpers";

const meta = {
  title: "Skeletons/Profile",
  component: ProfileSkeleton,
  decorators: [withSkeletonTheme],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The skeleton in its default loading state. */
export const Loading: Story = {};

/** The skeleton, then the loaded content that replaces it. */
export const SkeletonToLoadedContent: Story = {
  render: () => (
    <SkeletonToContent
      skeleton={<ProfileSkeleton />}
      content={
        <section aria-label="Profile" className="mx-auto flex w-full max-w-md items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-xl font-bold text-white">AL</div>
          <div>
            <h2 className="text-lg font-semibold">Alice</h2>
            <p className="text-sm opacity-70">12-day streak · 87% win rate</p>
          </div>
        </section>
      }
    />
  ),
};
