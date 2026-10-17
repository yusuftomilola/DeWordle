import type { Meta, StoryObj } from "@storybook/react";
import { AchievementsSkeleton } from "./AchievementsSkeleton";
import { SkeletonToContent, withSkeletonTheme } from "./skeleton-story-helpers";

const meta = {
  title: "Skeletons/Achievements",
  component: AchievementsSkeleton,
  decorators: [withSkeletonTheme],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof AchievementsSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The skeleton in its default loading state. */
export const Loading: Story = {};

/** The skeleton, then the loaded content that replaces it. */
export const SkeletonToLoadedContent: Story = {
  render: () => (
    <SkeletonToContent
      skeleton={<AchievementsSkeleton />}
      content={
        <section aria-label="Achievements" className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <h2 className="text-lg font-semibold">Achievements</h2>
          {["First win", "Perfect game", "Seven-day streak"].map((name) => (
            <div key={name} className="flex items-center gap-3 rounded-xl border border-current/20 p-4 text-sm">
              <span aria-hidden="true">🏆</span>
              {name}
            </div>
          ))}
        </section>
      }
    />
  ),
};
