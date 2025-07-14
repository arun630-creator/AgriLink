import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  FileText, 
  Image, 
  Smile,
  MoreHorizontal,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: 'buyer' | 'farmer' | 'admin' | 'support';
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'order_update' | 'system';
  timestamp: Date;
  read: boolean;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }>;
}

interface ChatSession {
  id: string;
  type: 'support' | 'order' | 'farmer_buyer';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  status: 'active' | 'resolved' | 'pending';
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatBotResponse {
  type: 'text' | 'quick_reply' | 'order_status' | 'product_info';
  content: string;
  options?: string[];
  orderDetails?: any;
  productDetails?: any;
}

const RealTimeChat = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatBotResponses, setChatBotResponses] = useState<ChatBotResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'support' | 'order' | 'farmer_buyer'>('all');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchChatSessions();
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:5000/chat?userId=${user?.id}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        initializeWebSocket();
      }, 5000);
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        if (currentSession && data.sessionId === currentSession.id) {
          setMessages(prev => [...prev, data.message]);
        }
        updateSessionLastMessage(data.sessionId, data.message);
        break;
      case 'typing_indicator':
        if (currentSession && data.sessionId === currentSession.id) {
          setIsTyping(data.isTyping);
        }
        break;
      case 'chatbot_response':
        setChatBotResponses(prev => [...prev, data.response]);
        break;
      case 'order_update':
        handleOrderUpdate(data.orderUpdate);
        break;
    }
  };

  const fetchChatSessions = async () => {
    try {
      const response = await apiService.get('/chat/sessions');
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const response = await apiService.get(`/chat/sessions/${sessionId}/messages`);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    const messageData = {
      sessionId: currentSession.id,
      content: newMessage,
      type: 'text'
    };

    try {
      // Send via WebSocket for real-time delivery
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          data: messageData
        }));
      }

      // Also send via HTTP for persistence
      const response = await apiService.post('/chat/messages', messageData);
      if (response.success) {
        setNewMessage('');
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing_indicator',
        sessionId: currentSession?.id,
        isTyping
      }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentSession) return;

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', currentSession.id);

        const response = await apiService.post('/chat/upload', formData);
        if (response.success) {
          setMessages(prev => [...prev, response.data]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const createSupportSession = async () => {
    try {
      const response = await apiService.post('/chat/sessions', {
        type: 'support',
        subject: 'General Support'
      });
      if (response.success) {
        setSessions(prev => [response.data, ...prev]);
        setCurrentSession(response.data);
      }
    } catch (error) {
      console.error('Error creating support session:', error);
    }
  };

  const updateSessionLastMessage = (sessionId: string, message: Message) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, lastMessage: message, updatedAt: new Date() }
        : session
    ));
  };

  const handleOrderUpdate = (orderUpdate: any) => {
    // Handle real-time order updates
    const systemMessage: Message = {
      id: Date.now().toString(),
      sender: {
        id: 'system',
        name: 'System',
        role: 'system'
      },
      content: `Order ${orderUpdate.orderId} status updated to ${orderUpdate.status}`,
      type: 'order_update',
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesFilter = filterType === 'all' || session.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen flex">
      {/* Chat Sessions Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" onClick={createSupportSession}>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-1">
              {(['all', 'support', 'order', 'farmer_buyer'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                currentSession?.id === session.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setCurrentSession(session)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={session.participants[0]?.avatar} />
                  <AvatarFallback>
                    {session.participants[0]?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {session.participants.map(p => p.name).join(', ')}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(session.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    {session.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {session.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  {session.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {session.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={currentSession.participants[0]?.avatar} />
                    <AvatarFallback>
                      {currentSession.participants[0]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {currentSession.participants.map(p => p.name).join(', ')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(currentSession.status)}>
                        {currentSession.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {currentSession.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender.id === user?.id ? 'order-2' : 'order-1'
                  }`}>
                    <div className={`flex items-start gap-2 ${
                      message.sender.id === user?.id ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>
                          {message.sender.role === 'system' ? (
                            <Bot className="w-4 h-4" />
                          ) : (
                            message.sender.name.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-lg px-3 py-2 ${
                        message.sender.id === user?.id
                          ? 'bg-blue-500 text-white'
                          : message.sender.role === 'system'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {message.type === 'order_update' && (
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium">Order Update</span>
                          </div>
                        )}
                        
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {attachment.type === 'image' ? (
                                  <Image className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                                <span className="text-xs">{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.read && (
                            <CheckCircle className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-600">typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      sendTypingIndicator(true);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    onBlur={() => sendTypingIndicator(false)}
                    multiline
                  />
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChat; 