
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const formatAIText = (text = "") => {
    return String(text)
        .replace(/\\\*\\\*/g, "**")
        .replace(/\\\*/g, "*")
        .replace(/\\_/g, "_")
        .replace(/&#x20;/gi, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\r\n/g, "\n")
        .trim();
};

const MarkdownResponse = ({ content }) => {
    const formattedContent = formatAIText(content);

    return (
        <div className="min-w-0 space-y-3 break-words text-sm leading-7 text-slate-200">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h2 className="mb-3 mt-5 text-xl font-bold text-white first:mt-0">
                            {children}
                        </h2>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mb-3 mt-5 border-b border-slate-700 pb-2 text-lg font-bold text-white first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mb-2 mt-4 text-base font-bold text-indigo-300">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mb-2 mt-3 font-semibold text-white">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="my-2 whitespace-normal">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-white">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-slate-200">
                            {children}
                        </em>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-3 list-disc space-y-2 pl-6 marker:text-indigo-400">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-3 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-indigo-300">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="pl-1">
                            {children}
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="my-3 border-l-4 border-indigo-500 pl-4 italic text-slate-300">
                            {children}
                        </blockquote>
                    ),
                    hr: () => (
                        <hr className="my-5 border-slate-700" />
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-700">
                            <table className="w-full border-collapse text-left text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-800 text-white">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-700">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="divide-x divide-slate-700">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="whitespace-nowrap px-3 py-2 font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="min-w-24 px-3 py-2 align-top">
                            {children}
                        </td>
                    ),
                    pre: ({ children }) => (
                        <pre className="my-3 max-w-full overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6">
                            {children}
                        </pre>
                    ),
                    code: ({ className, children, ...props }) => {
                        const isCodeBlock = Boolean(className);

                        return isCodeBlock ? (
                            <code
                                className={`${className} font-mono`}
                                {...props}
                            >
                                {children}
                            </code>
                        ) : (
                            <code className="break-words rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 font-mono text-xs text-indigo-200">
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {formattedContent}
            </ReactMarkdown>
        </div>
    );
};

const AICareerAdvisor = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [chats, setChats] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingChats, setLoadingChats] = useState(true);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const suggestions = [
        "Which career is best for my skills?",
        "How can I improve my programming skills?",
        "Create a learning roadmap for me",
        "Explain MERN stack in simple words",
    ];

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [history, loading]);

    const loadChats = async () => {
        try {
            const response = await api.get(
                "/api/ai-career-advisor/chats"
            );

            if (response.data?.status === 1) {
                setChats(response.data.data || []);
            }
        } catch (err) {
            console.error(
                "Unable to load chat history:",
                err.response?.data?.message || err.message
            );
        } finally {
            setLoadingChats(false);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const startNewChat = () => {
        if (loading) return;

        setChatId(null);
        setHistory([]);
        setMessage("");
        setError("");
        clearSelectedFile();
        setSidebarOpen(false);

        inputRef.current?.focus();
    };

    const openChat = async (selectedChatId) => {
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const response = await api.get(
                `/api/ai-career-advisor/chats/${selectedChatId}`
            );

            if (response.data?.status !== 1) {
                throw new Error(
                    response.data?.message || "Unable to open chat."
                );
            }

            const chat = response.data.data;

            setChatId(chat._id);
            setHistory(chat.messages || []);
            setMessage("");
            clearSelectedFile();
            setSidebarOpen(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to open this conversation."
            );
        } finally {
            setLoading(false);
        }
    };

    const renameChat = async (event, chat) => {
        event.stopPropagation();

        const newTitle = window.prompt(
            "Enter a new chat name:",
            chat.title
        );

        if (newTitle === null) return;

        if (!newTitle.trim()) {
            window.alert("Chat name cannot be empty.");
            return;
        }

        try {
            const response = await api.patch(
                `/api/ai-career-advisor/chats/${chat._id}`,
                { title: newTitle.trim() }
            );

            if (response.data?.status === 1) {
                setChats((previous) =>
                    previous.map((item) =>
                        item._id === chat._id
                            ? {
                                ...item,
                                title: response.data.data.title,
                            }
                            : item
                    )
                );
            }
        } catch (err) {
            window.alert(
                err.response?.data?.message ||
                "Unable to rename this chat."
            );
        }
    };

    const deleteChat = async (event, chat) => {
        event.stopPropagation();

        const confirmed = window.confirm(
            `Delete "${chat.title}"? This conversation will be permanently deleted.`
        );

        if (!confirmed) return;

        try {
            const response = await api.delete(
                `/api/ai-career-advisor/chats/${chat._id}`
            );

            if (response.data?.status === 1) {
                setChats((previous) =>
                    previous.filter((item) => item._id !== chat._id)
                );

                if (chatId === chat._id) {
                    setChatId(null);
                    setHistory([]);
                    setMessage("");
                    clearSelectedFile();
                }
            }
        } catch (err) {
            window.alert(
                err.response?.data?.message ||
                "Unable to delete this chat."
            );
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedExtensions = ["pdf", "docx", "txt"];
        const extension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            window.alert(
                "Please select a PDF, DOCX, or TXT file."
            );
            event.target.value = "";
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            window.alert("File size must be 10 MB or less.");
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
        setError("");
    };

    const sendMessage = async (text = message) => {
        const question = text.trim();

        if ((!question && !selectedFile) || loading) {
            return;
        }

        const attachment = selectedFile;

        const userMessage = {
            role: "user",
            text: question || `Attached file: ${attachment.name}`,
            ...(attachment
                ? {
                    attachment: {
                        name: attachment.name,
                        size: attachment.size,
                        type: attachment.type,
                    },
                }
                : {}),
        };

        setHistory((previous) => [
            ...previous,
            userMessage,
        ]);

        setMessage("");
        setError("");
        setLoading(true);

        try {
            let response;

            if (attachment) {
                const formData = new FormData();

                formData.append("message", question);

                if (chatId) {
                    formData.append("chatId", chatId);
                }

                formData.append("file", attachment);

                response = await api.post(
                    "/api/ai-career-advisor/chat",
                    formData
                );
            } else {
                response = await api.post(
                    "/api/ai-career-advisor/chat",
                    {
                        message: question,
                        ...(chatId ? { chatId } : {}),
                    }
                );
            }

            if (response.data?.status !== 1) {
                throw new Error(
                    response.data?.message ||
                    "Unable to get a response."
                );
            }

            const data = response.data.data;

            setChatId(data.chatId);

            setHistory((previous) => [
                ...previous,
                {
                    role: "model",
                    text: data.reply,
                },
            ]);

            clearSelectedFile();
            await loadChats();
        } catch (err) {
            const returnedChatId =
                err.response?.data?.data?.chatId;

            if (returnedChatId) {
                setChatId(returnedChatId);
            }

            const status = err.response?.status;

            if (status === 401) {
                setError(
                    "Your session may have expired. Please log in again."
                );
            } else if (status === 403) {
                setError(
                    "Please log in with a normal user account to use this feature."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Something went wrong. Please try again."
                );
            }

            await loadChats();
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage();
    };

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-slate-950 text-white">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 md:static md:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-slate-800 p-4">
                    <button
                        type="button"
                        onClick={() => navigate("/user-dashboard")}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white"
                    >
                        <span className="text-xl text-indigo-400">✦</span>
                        AI Career Copilot
                    </button>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close chat history"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-3">
                    <button
                        type="button"
                        onClick={startNewChat}
                        disabled={loading}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium hover:border-indigo-500 hover:bg-slate-800 disabled:opacity-50"
                    >
                        <span className="text-lg">＋</span>
                        New Chat
                    </button>
                </div>

                <div className="px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recent Chats
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
                    {loadingChats ? (
                        <p className="px-3 py-4 text-sm text-slate-500">
                            Loading conversations...
                        </p>
                    ) : chats.length === 0 ? (
                        <p className="px-3 py-4 text-sm leading-6 text-slate-500">
                            Your previous conversations will appear here.
                        </p>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => openChat(chat._id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        openChat(chat._id);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                className={`group rounded-xl px-3 py-3 transition ${
                                    chatId === chat._id
                                        ? "bg-slate-800"
                                        : "hover:bg-slate-800/70"
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 text-slate-400">
                                        ▤
                                    </span>

                                    <span className="min-w-0 flex-1 break-words text-sm text-slate-200">
                                        {chat.title}
                                    </span>

                                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                        <button
                                            type="button"
                                            title="Rename chat"
                                            aria-label={`Rename ${chat.title}`}
                                            onClick={(event) =>
                                                renameChat(event, chat)
                                            }
                                            className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                                        >
                                            ✎
                                        </button>

                                        <button
                                            type="button"
                                            title="Delete chat"
                                            aria-label={`Delete ${chat.title}`}
                                            onClick={(event) =>
                                                deleteChat(event, chat)
                                            }
                                            className="rounded-md p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-300"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t border-slate-800 p-3">
                    <button
                        type="button"
                        onClick={() => navigate("/user-dashboard")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <span>←</span>
                        Back to Dashboard
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
                            title="Show chat history"
                            aria-label="Show chat history"
                        >
                            ☰
                        </button>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
                            ✦
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate font-bold sm:text-lg">
                                AI Career Advisor
                            </h1>
                            <p className="text-xs text-slate-400">
                                Your personal AI assistant
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={startNewChat}
                        disabled={loading}
                        className="shrink-0 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40 md:hidden"
                    >
                        + New
                    </button>
                </header>

                <main className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col">

                            {history.length === 0 ? (
                                <section className="flex flex-1 flex-col items-center justify-center py-12 sm:py-16">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-400/20 bg-indigo-500/10 text-3xl text-indigo-300">
                                        ✦
                                    </div>

                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                                        AI Career Copilot
                                    </p>

                                    <h2 className="max-w-2xl text-center text-3xl font-bold leading-tight sm:text-5xl">
                                        Your next chapter
                                        <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
                                            starts with a question.
                                        </span>
                                    </h2>

                                    <p className="mt-5 max-w-xl text-center text-sm leading-7 text-slate-400 sm:text-base">
                                        Get career guidance, explore new skills,
                                        build your learning roadmap, or ask me anything.
                                    </p>

                                    <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                type="button"
                                                onClick={() => sendMessage(suggestion)}
                                                disabled={loading}
                                                className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left text-sm text-slate-300 transition hover:border-indigo-500/60 hover:bg-slate-900 disabled:opacity-50"
                                            >
                                                <span>{suggestion}</span>
                                                <span className="text-lg text-slate-500">
                                                    →
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ) : (
                                <section className="flex-1 space-y-6 py-8">
                                    {history.map((item, index) => (
                                        <div
                                            key={`${index}-${item.role}`}
                                            className={`flex gap-3 sm:gap-4 ${
                                                item.role === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            {item.role === "model" && (
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
                                                    ✦
                                                </div>
                                            )}

                                            <div
                                                className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[80%] sm:px-5 ${
                                                    item.role === "user"
                                                        ? "rounded-br-md bg-indigo-600 text-white"
                                                        : "rounded-tl-md border border-slate-800 bg-slate-900 text-slate-200"
                                                }`}
                                            >
                                                {item.role === "model" && (
                                                    <p className="mb-3 text-xs font-semibold text-indigo-300">
                                                        AI Career Advisor
                                                    </p>
                                                )}

                                                {item.role === "model" ? (
                                                    <MarkdownResponse content={item.text} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-7">
                                                        {item.text}
                                                    </p>
                                                )}

                                                {item.attachment && (
                                                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/20 bg-black/10 p-3">
                                                        <span className="text-xl">
                                                            📎
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium">
                                                                {item.attachment.name}
                                                            </p>

                                                            {typeof item.attachment.size === "number" && (
                                                                <p className="text-xs opacity-70">
                                                                    {(
                                                                        item.attachment.size /
                                                                        (1024 * 1024)
                                                                    ).toFixed(2)} MB
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {item.role === "user" && (
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold">
                                                    You
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <span className="text-xl text-indigo-300">
                                                ✦
                                            </span>
                                            AI Career Advisor is thinking...
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </section>
                            )}

                            {error && (
                                <div
                                    role="alert"
                                    className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >
                                    <span className="break-words">{error}</span>

                                    <button
                                        type="button"
                                        onClick={() => setError("")}
                                        aria-label="Dismiss error"
                                        className="shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message composer */}
                    <div className="shrink-0 border-t border-slate-800/70 bg-slate-950 px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
                        <div className="mx-auto max-w-4xl">
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-xl transition focus-within:border-indigo-500/70"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.txt"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {selectedFile && (
                                    <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-lg">
                                                📎
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {(
                                                        selectedFile.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={clearSelectedFile}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                            aria-label="Remove attached file"
                                            title="Remove file"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" &&
                                            !event.shiftKey &&
                                            !event.nativeEvent.isComposing
                                        ) {
                                            event.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    maxLength={4000}
                                    placeholder="Ask about careers, skills, coding, or attach your resume..."
                                    aria-label="Your message"
                                    className="max-h-36 min-h-12 w-full resize-y bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                                />

                                <div className="flex items-center justify-between gap-3 px-2 pb-1">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={loading}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-xl text-slate-300 transition hover:border-indigo-500 hover:bg-slate-800 disabled:opacity-40"
                                            title="Attach resume or document"
                                            aria-label="Attach a file"
                                        >
                                            +
                                        </button>

                                        <p className="hidden text-xs text-slate-500 sm:block">
                                            Enter to send · Shift + Enter for a new line
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            (!message.trim() && !selectedFile) ||
                                            loading
                                        }
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Send message"
                                        title="Send message"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="19"
                                            height="19"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                            <path d="M22 2 11 13" />
                                        </svg>
                                    </button>
                                </div>
                            </form>

                            <p className="mt-3 text-center text-xs text-slate-600">
                                AI can make mistakes. Verify important career and education decisions.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AICareerAdvisor;
