import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, User, Bot, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";

interface Message {
	id: string;
	role: "user" | "model";
	content: string;
}

export default function AIChatbot() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleOpenChat = () => setIsOpen(true);
		window.addEventListener("open-ai-chat", handleOpenChat);
		return () => window.removeEventListener("open-ai-chat", handleOpenChat);
	}, []);

	const [messages, setMessages] = useState<Message[]>([
		{
			id: "init-msg",
			role: "model",
			content:
				"হ্যালো! আমি YEASIN EARTH এর AI অ্যাসিস্ট্যান্ট। পৃথিবীর যেকোনো দেশ, ভূগোল, বা মুদ্রা সম্পর্কে আমাকে প্রশ্ন করতে পারেন।",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Keep track of the chat session
	const chatSessionRef = useRef<any>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isOpen]);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		setInput("");
		setMessages((prev) => [
			...prev,
			{ id: Date.now().toString(), role: "user", content: userMessage },
		]);
		setIsLoading(true);

		try {
			const apiKey = process.env.GEMINI_API_KEY;
			if (!apiKey) {
				throw new Error("API Key not found");
			}

			const ai = new GoogleGenAI({ apiKey });

			// Initialize chat session if it doesn't exist
			if (!chatSessionRef.current) {
				chatSessionRef.current = ai.chats.create({
					model: "gemini-3.1-flash-lite-preview",
					config: {
						systemInstruction:
							"You are the AI Assistant for the 'YEASIN EARTH' web application. Your name is EarthBot. You represent the application built by Yeasin. The app allows users to explore 196 countries on a 3D globe, convert currencies, read geographical facts, and take tests. Answer questions gracefully and concisely about geography, currency, and the app itself, in the language the user speaks (defaulting to Bengali if possible).",
					},
				});
			}

			const response = await chatSessionRef.current.sendMessage({
				message: userMessage,
			});

			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					role: "model",
					content: response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।",
				},
			]);
		} catch (error) {
			console.error("Chat Error", error);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					role: "model",
					content:
						"দুঃখিত, সংযোগে কোনো সমস্যা হয়েছে। API Key ঠিক আছে কিনা চেক করুন বা কিছুক্ষণ পর চেষ্টা করুন।",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 ${isOpen ? "hidden" : "block"}`}
			>
				<MessageSquare size={28} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[90vw] sm:w-[400px] h-[600px] max-h-[85vh] bg-[#0a0a12] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10 backdrop-blur-xl"
					>
						{/* Header */}
						<div className="p-5 bg-white/5 border-b border-white/5 flex justify-between items-center shrink-0">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
									<Bot size={24} className="text-white" />
								</div>
								<div>
									<h3 className="font-bold text-lg text-white leading-tight">
										EarthBot AI
									</h3>
									<p className="text-xs text-blue-400 font-semibold tracking-wide uppercase">
										Smart Guide
									</p>
								</div>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
							>
								<X size={20} />
							</button>
						</div>

						{/* Chat Area */}
						<div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 hide-scrollbar flex flex-col">
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
								>
									<div
										className={`p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-blue-600/20 text-blue-400" : "bg-white/5 border border-white/10 text-gray-300"}`}
									>
										{msg.role === "user" ? (
											<User size={20} />
										) : (
											<Bot size={20} />
										)}
									</div>
									<div
										className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
											msg.role === "user"
												? "bg-blue-600 text-white rounded-tr-none"
												: "bg-[#030712] border border-white/10 text-gray-200 rounded-tl-none font-medium"
										}`}
									>
										{msg.role === "model" ? (
											<div className="markdown-body prose-sm prose-p:leading-relaxed prose-a:text-blue-400">
												<Markdown>{msg.content}</Markdown>
											</div>
										) : (
											<p>{msg.content}</p>
										)}
									</div>
								</div>
							))}
							{isLoading && (
								<div className="flex gap-3 max-w-[80%]">
									<div className="p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 shadow-sm bg-white/5 border border-white/10 text-gray-300">
										<Bot size={20} />
									</div>
									<div className="p-4 rounded-2xl bg-[#030712] border border-white/10 text-blue-400 rounded-tl-none flex items-center gap-3 font-semibold text-sm">
										<Loader2 size={18} className="animate-spin" /> Thinking...
									</div>
								</div>
							)}
							<div ref={messagesEndRef} className="pt-2" />
						</div>

						{/* Input Area */}
						<div className="p-3 md:p-4 bg-white/5 border-t border-white/5 shrink-0">
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSend();
								}}
								className="flex items-center gap-2 relative"
							>
								<input
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="আমাকে যেকোনো কিছু জিজ্ঞেস করুন..."
									className="w-full bg-[#030712]/50 border border-white/10 rounded-full py-4 px-6 text-sm text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium pr-[60px]"
								/>
								<button
									type="submit"
									disabled={!input.trim() || isLoading}
									className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
								>
									<Send size={16} className="ml-1" />
								</button>
							</form>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
