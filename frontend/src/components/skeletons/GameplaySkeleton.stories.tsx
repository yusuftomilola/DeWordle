import type { Meta, StoryObj } from "@storybook/react";
import { GameplaySkeleton } from "./GameplaySkeleton";
import { SkeletonToContent, withSkeletonTheme } from "./skeleton-story-helpers";

const meta = {
  title: "Skeletons/Gameplay",
  component: GameplaySkeleton,
  decorators: [withSkeletonTheme],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof GameplaySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The skeleton in its default loading state. */
export const Loading: Story = {};

/** The skeleton, then the loaded content that replaces it. */
export const SkeletonToLoadedContent: Story = {
  render: () => (
    <SkeletonToContent
      skeleton={<GameplaySkeleton />}
      content={
        <section aria-label="Gameplay" className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
          <h2 className="text-lg font-semibold">Daily puzzle</h2>
          <div className="grid grid-cols-5 gap-1.5">
            {"CRANE".split("").map((letter, i) => (
              <div key={i} className="flex h-12 w-12 items-center justify-center rounded border border-green-600 bg-green-600 text-xl font-bold text-white">
                {letter}
              </div>
            ))}
          </div>
          <p className="text-sm opacity-70">Solved in 1 guess</p>
        </section>
      }
    />
  ),
};
