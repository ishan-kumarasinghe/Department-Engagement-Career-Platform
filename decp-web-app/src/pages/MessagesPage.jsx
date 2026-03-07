import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Mock data
  useEffect(() => {
    const mockConversations = [
      {
        id: '1',
        otherUser: { _id: 'user1', fullName: 'Alice Johnson', role: 'student' },
        lastMessage: 'That sounds great! Let me check my calendar.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        unread: 2,
      },
      {
        id: '2',
        otherUser: { _id: 'user2', fullName: 'Bob Smith', role: 'alumni' },
        lastMessage: 'Sure, I can help you with the internship application.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unread: 0,
      },
      {
        id: '3',
        otherUser: { _id: 'user3', fullName: 'Carol Davis', role: 'alumni' },
        lastMessage: 'Looking forward to collaborating with you!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unread: 1,
      },
    ];
    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0]);
      loadMessages(mockConversations[0].id);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = (conversationId) => {
    // Mock messages
    const mockMessages = [
      {
        id: '1',
        senderId: 'user1',
        senderName: 'Alice Johnson',
        content: 'Hey! How are you doing?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: '2',
        senderId: user?._id,
        senderName: user?.fullName,
        content: "I'm doing great! How about you?",
        timestamp: new Date(Date.now() - 28 * 60 * 1000),
      },
      {
        id: '3',
        senderId: 'user1',
        senderName: 'Alice Johnson',
        content: 'Good! Do you want to meet up for coffee?',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        id: '4',
        senderId: user?._id,
        senderName: user?.fullName,
        content: 'Sure! When are you free?',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: '5',
        senderId: 'user1',
        senderName: 'Alice Johnson',
        content: 'How about tomorrow at 3 PM?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: '6',
        senderId: user?._id,
        senderName: user?.fullName,
        content: 'That sounds great! Let me check my calendar.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: user?._id,
      senderName: user?.fullName,
      content: messageInput,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Update conversation last message
    setConversations(
      conversations.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: messageInput, timestamp: new Date() }
          : conv
      )
    );

    // In production, call chatApi.post(`/api/conversations/${selectedConversation.id}/messages`, {...})
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'yesterday';
    return `${days}d`;
  };

  return (
    <div className="flex h-[calc(100vh-73px)] bg-gray-50 max-w-7xl mx-auto">
      {/* Conversations List */}
      <div className="hidden md:flex md:w-80 bg-white border-r border-gray-200 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                loadMessages(conversation.id);
              }}
              className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-all ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {conversation.otherUser.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900">
                      {conversation.otherUser.fullName}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {conversation.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full md:w-auto">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {selectedConversation.otherUser.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedConversation.otherUser.fullName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {selectedConversation.otherUser.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => {
              const isOwnMessage = message.senderId === user?._id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-3">
                      {message.senderName.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-right' : 'text-left'} text-gray-500`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
