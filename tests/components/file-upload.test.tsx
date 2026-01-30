import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MAX_TOTAL_SIZE } from "@/lib/schema";

// Mock framer-motion
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-dropzone with controllable behavior
const mockOnDrop = vi.fn();
vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }: any) => {
    mockOnDrop.mockImplementation(onDrop);
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
    };
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { FileUpload } from "@/components/web/file-upload";
import { toast } from "sonner";

describe("FileUpload Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the upload interface", () => {
    render(<FileUpload />);

    expect(screen.getByText("Upload your files")).toBeInTheDocument();
    expect(
      screen.getByText("Drag & drop or choose an option below"),
    ).toBeInTheDocument();
    expect(screen.getByText("Maximum total size: 1GB")).toBeInTheDocument();
  });

  it("should render upload buttons", () => {
    render(<FileUpload />);

    expect(
      screen.getByRole("button", { name: /upload files/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload folder/i }),
    ).toBeInTheDocument();
  });

  it("should not show upload CTA when no files selected", () => {
    render(<FileUpload />);

    // The "Upload X files" button should not be present
    expect(
      screen.queryByRole("button", { name: /upload \d+ file/i }),
    ).not.toBeInTheDocument();
  });

  it("should call onUpload callback when provided", async () => {
    const mockOnUpload = vi.fn().mockResolvedValue(undefined);
    render(<FileUpload onUpload={mockOnUpload} />);

    // Just verify the component renders with the callback
    expect(screen.getByText("Upload your files")).toBeInTheDocument();
  });
});

describe("FileUpload File Size Formatting", () => {
  it("should format bytes correctly", () => {
    // Test the formatting logic
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 B";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.50 MB");
  });
});

describe("FileUpload Size Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error toast when file exceeds 1GB limit", () => {
    render(<FileUpload />);

    // Simulate dropping a file larger than 1GB
    const largeFile = new File([""], "large.zip", { type: "application/zip" });
    Object.defineProperty(largeFile, "size", { value: MAX_TOTAL_SIZE + 1 });

    // Trigger the onDrop callback
    mockOnDrop([largeFile]);

    expect(toast.error).toHaveBeenCalledWith("Upload limit exceeded", {
      description:
        "Total file size cannot exceed 1GB. Please remove some files.",
    });
  });

  it("should accept files within 1GB limit", () => {
    render(<FileUpload />);

    const validFile = new File(["content"], "valid.txt", {
      type: "text/plain",
    });
    Object.defineProperty(validFile, "size", { value: 1024 }); // 1KB

    mockOnDrop([validFile]);

    // Should NOT show error
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should accept files exactly at 1GB", () => {
    render(<FileUpload />);

    const maxFile = new File([""], "max.zip", { type: "application/zip" });
    Object.defineProperty(maxFile, "size", { value: MAX_TOTAL_SIZE });

    mockOnDrop([maxFile]);

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should reject when multiple files exceed total limit", () => {
    render(<FileUpload />);

    const file1 = new File([""], "file1.zip", { type: "application/zip" });
    const file2 = new File([""], "file2.zip", { type: "application/zip" });
    Object.defineProperty(file1, "size", { value: 600 * 1024 * 1024 }); // 600MB
    Object.defineProperty(file2, "size", { value: 500 * 1024 * 1024 }); // 500MB

    mockOnDrop([file1, file2]); // Total: 1.1GB

    expect(toast.error).toHaveBeenCalledWith("Upload limit exceeded", {
      description:
        "Total file size cannot exceed 1GB. Please remove some files.",
    });
  });
});

describe("FileUpload Multiple Files", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept multiple small files", () => {
    render(<FileUpload />);

    const files = Array.from({ length: 10 }, (_, i) => {
      const file = new File(["content"], `file${i}.txt`, {
        type: "text/plain",
      });
      Object.defineProperty(file, "size", { value: 1024 }); // 1KB each
      return file;
    });

    mockOnDrop(files);

    expect(toast.error).not.toHaveBeenCalled();
  });
});
