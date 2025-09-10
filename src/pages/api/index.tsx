import ChatSessions from "@/components/ChatSessions";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Sessions</h1>
      <ChatSessions />
    </div>
  );
}
