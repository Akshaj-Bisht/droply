import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { DownloadByCode } from "@/components/web/download-by-code";

describe("DownloadByCode Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the share page for a valid code", () => {
    render(<DownloadByCode />);

    fireEvent.change(screen.getByLabelText("Share code"), {
      target: { value: "Ab123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /open files/i }));

    expect(push).toHaveBeenCalledWith("/share/Ab123");
  });

  it("focuses the input when the panel is clicked", () => {
    render(<DownloadByCode />);

    fireEvent.click(
      screen.getByRole("heading", { name: "Download shared files" }),
    );

    expect(screen.getByLabelText("Share code")).toHaveFocus();
  });

  it("extracts the code from a share link", () => {
    render(<DownloadByCode />);

    fireEvent.change(screen.getByLabelText("Share code"), {
      target: { value: "https://droply.example/share/Ab123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /open files/i }));

    expect(push).toHaveBeenCalledWith("/share/Ab123");
  });

  it("shows an error for an invalid code", () => {
    render(<DownloadByCode />);

    fireEvent.change(screen.getByLabelText("Share code"), {
      target: { value: "invalid code" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /open files/i }));

    expect(
      screen.getByText("Enter a valid share code or link."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
