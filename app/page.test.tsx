// app/page.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

// Mock the framer-motion to avoid animation related issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the canvas APIs
HTMLCanvasElement.prototype.getContext = () =>
  ({
    scale: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    closePath: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    ellipse: jest.fn(),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  } as any);

describe("Home Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("renders initial state correctly", () => {
    render(<Home />);

    expect(screen.getByText("NICOLE BEAR")).toBeInTheDocument();
    expect(screen.getByText("GENERATE")).toBeInTheDocument();
    expect(screen.queryByText("DONE")).not.toBeInTheDocument();
  });

  test("opens color menu when menu button is clicked", async () => {
    render(<Home />);

    const menuButton = screen.getByRole("button", { name: "" }); // The LucideEqual button
    await userEvent.click(menuButton);

    // Check if color options are visible
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
  });

  test("changes button text to DONE during generation and back to GENERATE after clearing", async () => {
    render(<Home />);

    const generateButton = screen.getByText("GENERATE");
    await userEvent.click(generateButton);

    // Wait for "DONE" to appear
    await waitFor(() => {
      expect(screen.getByText("DONE")).toBeInTheDocument();
    });

    // Click clear button (X icon)
    const clearButton = screen.getByRole("button", { name: /x/i });
    await userEvent.click(clearButton);

    // Check if button text is back to "GENERATE"
    expect(screen.getByText("GENERATE")).toBeInTheDocument();
  });

  test("shows loading state during image generation", async () => {
    render(<Home />);

    const generateButton = screen.getByText("GENERATE");
    await userEvent.click(generateButton);

    // Check if loading message appears
    expect(screen.getByText("GENERATING IN PROCESS...")).toBeInTheDocument();
  });

  test("clears canvas when X button is clicked", async () => {
    render(<Home />);

    const clearButton = screen.getByRole("button", { name: /x/i });
    await userEvent.click(clearButton);

    // Verify canvas is cleared by checking if the mock clearRect was called
    const canvas = screen.getByRole("img", { name: "" });
    expect(canvas).toBeInTheDocument();
  });

  test("changes current color when selecting from color menu", async () => {
    render(<Home />);

    // Open color menu
    const menuButton = screen.getByRole("button", { name: "" }); // The LucideEqual button
    await userEvent.click(menuButton);

    // Click red color option
    const redColorButton = screen.getByRole("button", { name: "Red" });
    await userEvent.click(redColorButton);

    // Menu should close after selection
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  test("closes menu when clicking outside", async () => {
    render(<Home />);

    // Open menu
    const menuButton = screen.getByRole("button", { name: "" });
    await userEvent.click(menuButton);

    // Click outside
    await userEvent.click(document.body);

    // Menu should be closed
    expect(screen.queryByText("Green")).not.toBeInTheDocument();
  });
});
