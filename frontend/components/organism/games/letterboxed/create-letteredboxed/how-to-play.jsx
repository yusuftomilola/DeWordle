'use client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LetteredBoxedHowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">How to Play Letter Boxed</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <p>
            Letter Boxed is a word puzzle where letters are arranged around a
            square.
          </p>

          <div className="space-y-2">
            <h3 className="font-medium">Rules:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create words by connecting letters</li>
              <li>
                You cannot use two letters from the same side of the square in a
                row
              </li>
              <li>
                Each word must start with the last letter of the previous word
              </li>
              <li>Try to use all letters in the fewest words possible</li>
              <li>The goal is to use all letters in 6 words or fewer</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button className="w-full bg-[#2e2e7a]" onClick={onClose}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
