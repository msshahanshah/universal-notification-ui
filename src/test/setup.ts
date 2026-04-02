import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Material-UI theme
vi.mock("@mui/material/styles", () => ({
  useTheme: () => ({
    vars: {
      palette: {
        background: {
          paper: "#ffffff",
          default: "#f5f5f5",
        },
        text: {
          primary: "#000000",
          secondary: "#666666",
        },
        divider: "#e0e0e0",
        success: {
          main: "#4caf50",
          light: "#e8f5e8",
        },
        error: {
          main: "#f44336",
          light: "#ffebee",
        },
      },
    },
  }),
}));

// Mock Jotai atoms
vi.mock("jotai", () => ({
  useAtom: vi.fn(),
  atom: vi.fn(),
}));

// Mock snackbar provider
vi.mock("src/provider/snackbar", () => ({
  useSnackbar: () => vi.fn(),
}));

// Mock utility functions
vi.mock("src/utility/helper", () => ({
  isBodyEmpty: vi.fn(),
  renameDuplicateFiles: vi.fn(),
}));

vi.mock("src/utility/sms", () => ({
  checkValidRecipientsforSMSWrapper: vi.fn(),
}));

vi.mock("src/utility/whatsapp", () => ({
  formatNumbersForUniqueKey: vi.fn(),
}));

// Mock API
vi.mock("src/lib/axios", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
  QueryClient: vi.fn(),
}));

// Mock constants
vi.mock("src/utility/constants", () => ({
  DRAWER_WIDTH: 218,
  DRAWER_TOP_MARGIN: 150,
  COLLAPSED_WIDTH: 64,
  usernameRegex: /^[a-zA-Z]{3,10}@[a-zA-Z]{1,5}$/,
  passwordRegex: /^[^\s]{8,12}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slackRegex: /^[CGD][A-Z0-9]{8,10}$/,
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
