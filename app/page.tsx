"use client";

import LandingSections from "@/components/LandingSections";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownCircleIcon,
  Loader,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(false);
  const chatIconRef = useRef(null);
  const {
    messages,
    handleSubmit,
    handleInputChange,
    isLoading,
    stop,
    reload,
    error,
  } = useChat({ api: "/api/gemini" });

  // New state for input value
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setShowChatIcon(true);
    setIsChatOpen(true);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Custom submit handler to clear input after submitting
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
    setInputValue("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />
      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={toggleChat}
              ref={chatIconRef}
              size={"icon"}
              className="rounded-full size-14 p-2 shadow-sm"
            >
              {!isChatOpen ? <MessageCircle /> : <ArrowDownCircleIcon />}
            </Button>
          </motion.div>
        )}
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold">
                  Chat with NoteWorthy AI
                </CardTitle>
                <Button
                  onClick={toggleChat}
                  size={"icon"}
                  variant={"ghost"}
                  className="px-2 py-0"
                >
                  <X size={"4"} />
                  <span className="sr-only">Close chat</span>
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {messages.length === 0 && (
                    <div className="w-full mt-32 text-gray-500 flex flex-col items-center justify-center gap-2 text-center px-4">
                      <div className="text-4xl">😊</div>
                      <p className="text-lg font-semibold">
                        Hey! I'm your AI assistant
                      </p>
                      <p className="text-sm text-gray-500 max-w-sm">
                        Ask me anything about NoteWorthy
                      </p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg max-w-[80%] p-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <ReactMarkdown
                          children={message.content}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ inline, className, children, ...props }) {
                              return inline ? (
                                <code
                                  className="bg-gray-200 px-1 rounded"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre>
                                  <code
                                    className="bg-gray-200 px-1 rounded"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="pl-4">{children}</li>
                            ),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="w-full items-center justify-center flex gap-3">
                      <Loader className="animate-spin" />
                      <button
                        onClick={stop}
                        type="button"
                        className="underline"
                      >
                        abort
                      </button>
                    </div>
                  )}
                  {error && (
                    <div className="w-full items-center justify-center flex gap-3">
                      <div className="text-red-500">{error.message}</div>
                      <button
                        onClick={() => reload()}
                        type="button"
                        className="underline"
                      >
                        try again
                      </button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form
                  onSubmit={onSubmit}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      handleInputChange(e);
                    }}
                    className="flex-1"
                    placeholder="type your message"
                  />
                  <Button
                    type="submit"
                    className="size-9"
                    disabled={isLoading}
                    size={"icon"}
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
