"use client";

import { ArrowLeft, Headphones, Loader2, Send, User } from "lucide-react";
import { ticketStatusLabel } from "@/constants/help-topics";
import { formatTimeOnly } from "@/lib/dateTimeUtils";
import type { UseSupportChatPageResult } from "@/hooks/use-support-chat-page";

type SupportChatMobileViewProps = UseSupportChatPageResult & {
  isDesktop?: boolean;
};

export function SupportChatMobileView({
  activeTicket,
  messages,
  inputValue,
  setInputValue,
  loading,
  sending,
  error,
  canRespond,
  messagesEndRef,
  handleBack,
  handleSend,
  isDesktop = false,
}: SupportChatMobileViewProps) {
  const clientName =
    activeTicket?.client_name ??
    activeTicket?.client?.full_name ??
    (activeTicket ? `Клиент #${activeTicket.id}` : null);

  const title = canRespond
    ? clientName ?? "Чат с клиентом"
    : `Обращение #${activeTicket?.id ?? ""}`;

  const subtitle = canRespond
    ? activeTicket
      ? ticketStatusLabel(activeTicket.status)
      : ""
    : "Администратор";

  const inputBarClass = isDesktop
    ? "bottom-0 bg-surface-1 border-hairline"
    : canRespond
      ? "bottom-[calc(90px+env(safe-area-inset-bottom,0px))] bg-background border-border"
      : "bottom-[calc(70px+env(safe-area-inset-bottom,0px))] bg-background border-border";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-hairline pt-[max(3rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg text-content-tertiary hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
            {canRespond ? <User className="w-5 h-5 text-brand" /> : <Headphones className="w-5 h-5 text-brand" />}
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-white truncate">{title}</h1>
            <p className="text-xs text-content-tertiary">{subtitle}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {error ? <p className="text-brand text-sm">{error}</p> : null}
          {messages.map((msg) => {
            const isFromAdmin = msg.sender === "admin";
            const isOwnMessage = canRespond ? isFromAdmin : !isFromAdmin;
            const showOnLeft = !isOwnMessage;

            return (
              <div
                key={msg.id}
                className={`flex ${showOnLeft ? "justify-start" : "justify-end"} items-start gap-2`}
              >
                {showOnLeft && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      isFromAdmin ? "bg-brand" : "bg-surface-3"
                    }`}
                  >
                    {isFromAdmin ? (
                      <Headphones className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                    showOnLeft
                      ? "bg-surface-2 text-white rounded-tl-none"
                      : "bg-brand-fill text-white rounded-tr-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? "text-white/70" : "text-content-tertiary"}`}>
                    {formatTimeOnly(msg.created_at)}
                  </p>
                </div>
                {!showOnLeft && (
                  <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 mt-1">
                    {canRespond ? (
                      <Headphones className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {sending ? (
            <div className={`flex ${canRespond ? "justify-end" : "justify-end"}`}>
              <div className="px-4 py-3 rounded-2xl bg-brand/50 text-white text-sm">Отправка...</div>
            </div>
          ) : null}
          <div ref={messagesEndRef} aria-hidden />
        </main>

        <form
          onSubmit={(e) => handleSend(e)}
          className={`fixed left-0 right-0 border-t p-4 max-w-2xl mx-auto w-full z-10 ${inputBarClass}`}
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Напишите сообщение..."
                className="flex-1 border border-hairline rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand text-sm min-h-[48px] max-h-[120px] bg-surface-2 text-white placeholder-content-tertiary"
                rows={1}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || sending}
                className="bg-brand-fill text-white rounded-xl p-3 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
      </div>
    </>
  );
}
