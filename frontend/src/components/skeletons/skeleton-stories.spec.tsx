import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AchievementsSkeleton,
  GameplaySkeleton,
  ProfileSkeleton,
  RewardsSkeleton,
  SessionsSkeleton,
} from './index';
import { SkeletonToContent } from './skeleton-story-helpers';

const SKELETONS = [
  ['Gameplay', GameplaySkeleton, 'Loading gameplay'],
  ['Profile', ProfileSkeleton, 'Loading profile'],
  ['Rewards', RewardsSkeleton, 'Loading rewards'],
  ['Achievements', AchievementsSkeleton, 'Loading achievements'],
  ['Sessions', SessionsSkeleton, 'Loading sessions'],
] as const;

describe('skeleton stories', () => {
  it.each(SKELETONS)('the %s skeleton renders as a labelled loading status', (_name, Skeleton, label) => {
    render(<Skeleton />);
    expect(screen.getByRole('status', { name: label })).toBeInTheDocument();
  });

  describe('SkeletonToContent (skeleton-to-content transition)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('shows the skeleton first, then swaps to the content after the delay', () => {
      render(
        <SkeletonToContent
          skeleton={<GameplaySkeleton />}
          content={<p>Loaded content</p>}
          delayMs={1000}
        />,
      );
      expect(screen.getByRole('status', { name: 'Loading gameplay' })).toBeInTheDocument();
      expect(screen.queryByText('Loaded content')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Loaded content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('replays the transition', () => {
      render(
        <SkeletonToContent skeleton={<RewardsSkeleton />} content={<p>Loaded content</p>} delayMs={500} />,
      );
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText('Loaded content')).toBeInTheDocument();

      act(() => {
        screen.getByRole('button', { name: /replay/i }).click();
      });
      expect(screen.getByRole('status', { name: 'Loading rewards' })).toBeInTheDocument();
    });
  });
});
