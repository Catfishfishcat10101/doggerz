import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";

import { renderWithProviders } from "@/test/testUtils.jsx";
import BackPill from "./BackPill.jsx";
import Footer from "./Footer.jsx";
import GameTopBar from "./GameTopBar.jsx";
import Header from "./Header.jsx";
import PageShell from "./PageShell.jsx";
import { PageFooter, PageHeader } from "./PageSections.jsx";

jest.mock("@/config/links.js", () => ({
  SOCIAL_LINKS: {
    twitter: "https://x.com/doggerz",
  },
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("layout components", () => {
  test("BackPill renders as link when `to` is passed", () => {
    renderWithProviders(<BackPill to="/game" label="Back to Game" />);
    expect(screen.getByRole("link", { name: "Back to Game" })).toHaveAttribute(
      "href",
      "/game"
    );
  });

  test("BackPill button navigates back when no `to`", () => {
    renderWithProviders(
      <div>
        <LocationDisplay />
        <BackPill label="Back" />
      </div>,
      { route: "/settings" }
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/settings");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  test("Footer renders legal navigation links", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("link", { name: "Legal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
  });

  test("Header home route shows adopt/login", () => {
    renderWithProviders(<Header />, { route: "/" });
    expect(screen.getByRole("link", { name: "Adopt" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  test("Header app route shows nav pills for signed-in user", () => {
    renderWithProviders(<Header />, {
      route: "/settings",
      preloadedState: {
        user: {
          id: "u1",
          displayName: "Trainer",
          email: "x@y.com",
          avatarUrl: null,
          zip: null,
          dogRenderMode: "sprite",
          dogName: null,
          preferredScene: "auto",
          reduceVfx: false,
          uiDensity: "standard",
          locale: null,
          coins: 0,
          streak: { current: 0, best: 0, lastPlayedAt: null },
          createdAt: null,
        },
      },
    });
    expect(
      screen.getAllByRole("link", { name: "Game" }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Settings" }).length
    ).toBeGreaterThan(0);
  });

  test("GameTopBar triggers onExit for guests", () => {
    const onExit = jest.fn();
    renderWithProviders(<GameTopBar onExit={onExit} />);
    fireEvent.click(screen.getByRole("button", { name: "Exit" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  test("GameTopBar mobile menu expands to show links", () => {
    renderWithProviders(<GameTopBar links={[{ to: "/about", label: "About" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getAllByRole("link", { name: "About" }).length).toBeGreaterThan(0);
  });

  test("PageShell renders fallback marker when outside app shell", () => {
    renderWithProviders(
      <PageShell>
        <div>content</div>
      </PageShell>
    );
    expect(screen.getByText("App shell disabled")).toBeInTheDocument();
  });

  test("PageHeader and PageFooter apply structure classes", () => {
    renderWithProviders(
      <div>
        <PageHeader>Top</PageHeader>
        <PageFooter>Bottom</PageFooter>
      </div>
    );
    expect(screen.getByText("Top").closest("header")).toHaveClass("space-y-2");
    expect(screen.getByText("Bottom").closest("footer")).toHaveClass("pt-2");
  });
});
