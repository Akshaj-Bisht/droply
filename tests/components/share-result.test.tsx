import { render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
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
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

// Mock QRCode
vi.mock("qrcode.react", () => ({
  QRCodeCanvas: vi.fn(({ value }: { value: string }) => (
    <canvas data-testid="qr-code" data-value={value} />
  )),
}));

import ShareResult, {
  ShareResultSkeleton,
} from "@/components/web/share-result";

describe("ShareResultSkeleton Component", () => {
  it("should render loading skeletons", () => {
    render(<ShareResultSkeleton />);

    // Skeleton components have data-slot="skeleton" attribute
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ShareResult Component", () => {
  const mockUrl = "https://droply.app/share/abc123";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        write: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("should render the share URL", () => {
    render(<ShareResult url={mockUrl} />);

    expect(screen.getByText(mockUrl)).toBeInTheDocument();
  });

  it("should render the QR code", () => {
    render(<ShareResult url={mockUrl} />);

    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute("data-value", mockUrl);
  });

  it("should render copy button", () => {
    render(<ShareResult url={mockUrl} />);

    // Look for the copy button (has Copy icon)
    const copyButtons = screen.getAllByRole("button");
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it("should render share actions", () => {
    render(<ShareResult url={mockUrl} />);

    expect(screen.getByText(/copy qr/i)).toBeInTheDocument();
    expect(screen.getByText(/download qr/i)).toBeInTheDocument();
  });

  it("should render the go to download page button", () => {
    render(<ShareResult url={mockUrl} />);

    expect(screen.getByText(/go to download page/i)).toBeInTheDocument();
  });
});
