import React from "react";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/testUtils.jsx";
import DailyRewardModal from "./DailyRewardModal.jsx";

describe("DailyRewardModal", () => {
  test("does not render when closed", () => {
    renderWithProviders(<DailyRewardModal open={false} rewardState={{}} />);
    expect(
      screen.queryByRole("dialog", { name: "Daily reward" })
    ).not.toBeInTheDocument();
  });

  test("renders and invokes handlers", () => {
    const onClose = jest.fn();
    const onClaim = jest.fn();
    renderWithProviders(
      <DailyRewardModal
        open
        onClose={onClose}
        onClaim={onClaim}
        rewardState={{
          canClaim: true,
          nextStreakDay: 2,
          reward: { label: "10 Coins" },
        }}
      />
    );

    expect(
      screen.getByRole("dialog", { name: "Daily reward" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Later" }));
    fireEvent.click(screen.getByRole("button", { name: "Claim" }));
    expect(onClose).toHaveBeenCalled();
    expect(onClaim).toHaveBeenCalled();
  });

  test("disables claim when reward cannot be claimed", () => {
    renderWithProviders(
      <DailyRewardModal
        open
        rewardState={{ canClaim: false, nextStreakDay: 1 }}
      />
    );
    expect(screen.getByRole("button", { name: "Claim" })).toBeDisabled();
  });
});
