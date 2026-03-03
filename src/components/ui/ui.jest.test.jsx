import React from "react";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/testUtils.jsx";
import DogToy from "./DogToy.jsx";
import EmptySlate from "./EmptySlate.jsx";
import LongTermProgressionCard from "./LongTermProgressionCard.jsx";
import VoiceCommandButton from "./VoiceCommandButton.jsx";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe("ui components", () => {
  test("DogToy emits squeak callback on pointer interaction", () => {
    const onSqueak = jest.fn();
    renderWithProviders(<DogToy onSqueak={onSqueak} />);
    fireEvent.pointerDown(screen.getByText("🎾"));
    expect(onSqueak).toHaveBeenCalledWith(
      expect.objectContaining({ source: "tap" })
    );
  });

  test("EmptySlate invokes button callbacks", () => {
    const onPrimary = jest.fn();
    const onSecondary = jest.fn();
    renderWithProviders(
      <EmptySlate
        title="Nothing here"
        primaryLabel="Create"
        secondaryLabel="Cancel"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onPrimary).toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalled();
  });

  test("LongTermProgressionCard renders challenge rows", () => {
    renderWithProviders(
      <LongTermProgressionCard
        now={Date.now()}
        progression={{
          season: { level: 2, xp: 110, endsAt: Date.now() + 5 * 86400000 },
          journey: { level: 3, xp: 220 },
          daily: { seasonXpEarned: 30, journeyXpEarned: 8 },
          weekly: {
            weekKey: "2026-W10",
            challenges: [
              { id: "c1", label: "Feed 10 times", goal: 10, progress: 4 },
            ],
          },
        }}
      />
    );
    expect(screen.getByText("Long-term")).toBeInTheDocument();
    expect(screen.getByText("Feed 10 times")).toBeInTheDocument();
    expect(screen.getByText("4/10")).toBeInTheDocument();
  });

  test("VoiceCommandButton shows unsupported state when speech API is missing", () => {
    renderWithProviders(<VoiceCommandButton />);
    expect(
      screen.getByRole("button", { name: "Voice Training Not Supported" })
    ).toBeDisabled();
  });
});
