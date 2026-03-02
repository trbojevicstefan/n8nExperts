import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Inbox from "@/pages/workspace/Inbox";
import { chatApi } from "@/lib/api";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      _id: "client-1",
      role: "client",
    },
  }),
}));

vi.mock("@/lib/api", () => ({
  chatApi: {
    getThreads: vi.fn(),
    getThreadMessages: vi.fn(),
    markThreadRead: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

const mockedChatApi = vi.mocked(chatApi);

describe("Inbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedChatApi.getThreads.mockResolvedValue({
      data: {
        threads: [
          {
            _id: "thread-1",
            jobId: { _id: "job-1", title: "Client Workflow Job", status: "open" },
            clientId: { _id: "client-1", username: "client", img: "" },
            expertId: { _id: "expert-1", username: "Expert One", img: "", headline: "n8n expert" },
            invitationId: null,
            applicationId: "app-1",
            lastMessage: "Latest message",
            lastMessageAt: new Date().toISOString(),
            lastMessageSenderId: "client-1",
            unreadByClient: 0,
            unreadByExpert: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
    } as never);

    mockedChatApi.getThreadMessages.mockResolvedValue({
      data: {
        messages: [],
        pagination: { page: 1, limit: 40, total: 0, pages: 0 },
      },
    } as never);

    mockedChatApi.markThreadRead.mockResolvedValue({ data: {} } as never);

    mockedChatApi.sendMessage.mockResolvedValue({
      data: {
        _id: "message-1",
        threadId: "thread-1",
        jobId: "job-1",
        senderId: { _id: "client-1", username: "client" },
        body: "",
        attachments: [{ name: "report.pdf", url: "https://example.com/report.pdf" }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } as never);
  });

  it("supports thread search and sending attachment-only message", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/inbox"]}>
        <Inbox />
      </MemoryRouter>
    );

    const expertLabels = await screen.findAllByText("Expert One");
    expect(expertLabels.length).toBeGreaterThan(0);

    await user.type(screen.getByPlaceholderText("Search threads"), "workflow");

    await waitFor(() => {
      const calls = mockedChatApi.getThreads.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.some((call) => call[0]?.q === "workflow")).toBe(true);
    });

    await user.type(screen.getByPlaceholderText("Attachment URL (optional)"), "example.com/report.pdf");
    await user.click(screen.getByRole("button", { name: /add/i }));
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(mockedChatApi.sendMessage).toHaveBeenCalledWith("thread-1", {
        attachments: [{ name: "report.pdf", url: "https://example.com/report.pdf" }],
      });
    });
  });
});
