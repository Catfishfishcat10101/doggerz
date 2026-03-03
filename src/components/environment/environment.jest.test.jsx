import React from "react";
import { waitFor } from "@testing-library/react";

import { renderWithProviders } from "@/test/testUtils.jsx";
import CheckInReminders from "./CheckInReminders.jsx";
import PawPrintsBackground from "./PawPrintsBackground.jsx";
import WeatherFXCanvas from "./WeatherFXCanvas.jsx";

const mockScheduleLifeLoopNotifications = jest.fn();
const mockCancelLifeLoopNotifications = jest.fn();
const mockShowDoggerzNotification = jest.fn();
const mockLoadReminderStateAsync = jest.fn();
const mockShouldFireReminder = jest.fn();
const mockBuildReminder = jest.fn((v) => v);
const mockFireReminder = jest.fn();

jest.mock("@/utils/notifications.js", () => ({
  scheduleLifeLoopNotifications: (...args) =>
    mockScheduleLifeLoopNotifications(...args),
  cancelLifeLoopNotifications: (...args) =>
    mockCancelLifeLoopNotifications(...args),
  showDoggerzNotification: (...args) => mockShowDoggerzNotification(...args),
}));

jest.mock("@/utils/reminders.js", () => ({
  loadReminderStateAsync: (...args) => mockLoadReminderStateAsync(...args),
  shouldFireReminder: (...args) => mockShouldFireReminder(...args),
  buildReminder: (...args) => mockBuildReminder(...args),
  fireReminder: (...args) => mockFireReminder(...args),
}));

describe("environment components", () => {
  beforeEach(() => {
    mockScheduleLifeLoopNotifications.mockReset();
    mockCancelLifeLoopNotifications.mockReset();
    mockShowDoggerzNotification.mockReset();
    mockLoadReminderStateAsync.mockReset();
    mockShouldFireReminder.mockReset();
    mockBuildReminder.mockReset();
    mockFireReminder.mockReset();
    mockScheduleLifeLoopNotifications.mockResolvedValue(true);
    mockLoadReminderStateAsync.mockResolvedValue({});
    mockShouldFireReminder.mockReturnValue(true);
    mockShowDoggerzNotification.mockResolvedValue(true);
  });

  test("CheckInReminders schedules lifecycle notifications when enabled", async () => {
    renderWithProviders(<CheckInReminders />, {
      preloadedState: {
        dog: {
          memory: { lastSeenAt: Date.now() - 5 * 60 * 60 * 1000 },
        },
        settings: {
          dailyRemindersEnabled: true,
        },
      },
    });

    await waitFor(() => {
      expect(mockLoadReminderStateAsync).toHaveBeenCalled();
      expect(mockScheduleLifeLoopNotifications).toHaveBeenCalled();
    });
  });

  test("PawPrintsBackground renders deterministic count", () => {
    const { container } = renderWithProviders(
      <PawPrintsBackground count={8} seed="abc" />
    );
    expect(container.querySelectorAll("svg").length).toBe(8);
  });

  test("WeatherFXCanvas renders hidden canvas in none mode", () => {
    const { container } = renderWithProviders(<WeatherFXCanvas mode="none" />);
    const canvas = container.querySelector("canvas");
    expect(canvas.tagName.toLowerCase()).toBe("canvas");
    expect(canvas).toHaveStyle({ opacity: "0" });
  });
});
