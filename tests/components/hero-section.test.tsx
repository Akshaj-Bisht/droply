import { render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock framer-motion
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: ComponentPropsWithoutRef<"div">) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: ComponentPropsWithoutRef<"span">) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
      <p {...props}>{children}</p>
    ),
  },
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

// Mock Navbar component
vi.mock("@/components/web/navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

import HeroSection from "@/components/web/hero-section";

describe("HeroSection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the navbar", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("should render the headline words", () => {
    render(<HeroSection />);

    expect(screen.getByText("Upload.")).toBeInTheDocument();
    expect(screen.getByText("Share.")).toBeInTheDocument();
    expect(screen.getByText("Done.")).toBeInTheDocument();
  });

  it("should render the subtitle", () => {
    render(<HeroSection />);

    expect(
      screen.getByText(/Upload files or folders and share with anyone/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/auto-delete after 24 hours/i)).toBeInTheDocument();
  });
});
