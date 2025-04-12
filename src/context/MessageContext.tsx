import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';

export interface MessageAttachment {
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  title?: string; // Title for the conversation (e.g., service name)
  createdAt?: string;
  lastActivity?: string;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // Key is conversationId
  unreadCount: number;
  sendMessage: (conversationId: string, content: string, files?: File[]) => Promise<void>;
  createConversation: (participantId: string, title?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  getConversationMessages: (conversationId: string) => Message[];
  getConversation: (conversationId: string) => Conversation | undefined;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const API_URL = process.env.NODE_ENV === 'production'
    ? '/api/messages'
    : 'http://localhost:5001/api/messages';

  // Load user conversations when the user is authenticated
  useEffect(() => {
    if (user) {
      loadUserConversations();
    }
  }, [user]);

  // Load user conversations from API
  const loadUserConversations = async () => {
    try {
      if (!user) return;

      // Try to load conversations from local storage first
      const storedConversations = localStorage.getItem('workit_conversations');
      const storedMessages = localStorage.getItem('workit_messages');

      if (storedConversations && storedMessages) {
        try {
          const parsedConversations = JSON.parse(storedConversations);
          const parsedMessages = JSON.parse(storedMessages);
          setConversations(parsedConversations);
          setMessages(parsedMessages);

          // Still try to fetch from server in the background
          fetchConversationsFromServer();
        } catch (error) {
          console.error('Error parsing stored messages or conversations:', error);
          localStorage.removeItem('workit_conversations');
          localStorage.removeItem('workit_messages');
          fetchConversationsFromServer();
        }
      } else {
        fetchConversationsFromServer();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // If API fails, initialize with mock data for demo purposes
      initializeMockData();
    }
  };

  // Fetch conversations from the server
  const fetchConversationsFromServer = async () => {
    try {
      if (!user) return;

      const response = await axios.get(`${API_URL}/conversations/${user.id}`);
      const conversationsData = response.data;

      setConversations(conversationsData);

      // For each conversation, load its messages
      const messagesObj: Record<string, Message[]> = {};
      for (const conversation of conversationsData) {
        const messagesResponse = await axios.get(`${API_URL}/conversations/${conversation.id}/messages`);
        messagesObj[conversation.id] = messagesResponse.data;
      }

      setMessages(messagesObj);

      // Save to localStorage
      localStorage.setItem('workit_conversations', JSON.stringify(conversationsData));
      localStorage.setItem('workit_messages', JSON.stringify(messagesObj));
    } catch (error) {
      console.error('Error fetching from server:', error);
      // If API fails, initialize with mock data for demo purposes
      initializeMockData();
    }
  };

  useEffect(() => {
    // Calculate unread count when messages change
    if (user) {
      let count = 0;
      Object.values(messages).forEach(conversationMessages => {
        count += conversationMessages.filter(
          msg => msg.receiverId === user.id && !msg.isRead
        ).length;
      });
      setUnreadCount(count);
    }
  }, [messages, user]);

  const initializeMockData = () => {
    if (!user) return;

    // Mock conversation and messages
    const mockConversations: Conversation[] = [
      {
        id: 'conv_1',
        participants: [user.id, 'client_1'],
        title: 'Développement Web Fullstack',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        lastActivity: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'conv_2',
        participants: [user.id, 'client_2'],
        title: 'Création de Logo',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        lastActivity: new Date(Date.now() - 3600000 * 47).toISOString()
      },
      {
        id: 'conv_3',
        participants: [user.id, 'client_3'],
        title: 'Développement d\'API',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        lastActivity: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];

    const mockMessages: Record<string, Message[]> = {
      'conv_1': [
        {
          id: 'msg_1',
          senderId: 'client_1',
          receiverId: user.id,
          conversationId: 'conv_1',
          content: 'Bonjour, j\'aimerais discuter du projet de développement web.',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          isRead: true,
        },
        {
          id: 'msg_2',
          senderId: user.id,
          receiverId: 'client_1',
          conversationId: 'conv_1',
          content: 'Bonjour ! Bien sûr, je suis disponible pour en discuter. Quels sont vos besoins ?',
          timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
          isRead: true,
        },
        {
          id: 'msg_3',
          senderId: 'client_1',
          receiverId: user.id,
          conversationId: 'conv_1',
          content: 'J\'ai besoin d\'un site e-commerce avec une intégration de paiement.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          isRead: false,
        },
      ],
      'conv_2': [
        {
          id: 'msg_4',
          senderId: 'client_2',
          receiverId: user.id,
          conversationId: 'conv_2',
          content: 'Pouvez-vous me créer un logo pour ma nouvelle startup ?',
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          isRead: true,
        },
        {
          id: 'msg_5',
          senderId: user.id,
          receiverId: 'client_2',
          conversationId: 'conv_2',
          content: 'Bien sûr ! Pouvez-vous me donner plus de détails sur votre entreprise ?',
          timestamp: new Date(Date.now() - 3600000 * 47).toISOString(),
          isRead: true,
        },
      ],
      'conv_3': [
        {
          id: 'msg_6',
          senderId: 'client_3',
          receiverId: user.id,
          conversationId: 'conv_3',
          content: 'Bonjour, j\'ai besoin d\'une API pour mon application mobile.',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          isRead: false,
        },
      ],
    };

    setConversations(mockConversations);
    setMessages(mockMessages);

    localStorage.setItem('workit_conversations', JSON.stringify(mockConversations));
    localStorage.setItem('workit_messages', JSON.stringify(mockMessages));
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('workit_conversations', JSON.stringify(conversations));
    localStorage.setItem('workit_messages', JSON.stringify(messages));
  };

  const sendMessage = async (conversationId: string, content: string, files: File[] = []) => {
    if (!user) return;

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const receiverId = conversation.participants.find(id => id !== user.id) || '';

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      formData.append('senderId', user.id);
      formData.append('receiverId', receiverId);

      files.forEach(file => {
        formData.append('attachments', file);
      });

      // Try to send message via API
      const response = await axios.post(
        `${API_URL}/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // If successful, update local state with the response
      const newMessage = response.data;

      const updatedMessages = {
        ...messages,
        [conversationId]: [...(messages[conversationId] || []), newMessage],
      };

      const updatedConversations = conversations.map(c =>
        c.id === conversationId
          ? { ...c, lastActivity: new Date().toISOString(), lastMessage: newMessage }
          : c
      );

      setMessages(updatedMessages);
      setConversations(updatedConversations);
      saveToLocalStorage();

    } catch (error) {
      console.error('Error sending message via API:', error);

      // Fallback to local state update if API fails
      const newMessage: Message = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        senderId: user.id,
        receiverId,
        conversationId,
        content,
        // For mock data, we don't store actual files but just their metadata
        attachments: files.map(file => ({
          filename: `local_${Date.now()}_${file.name}`,
          originalName: file.name,
          path: URL.createObjectURL(file),
          mimetype: file.type,
          size: file.size
        })),
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      const updatedMessages = {
        ...messages,
        [conversationId]: [...(messages[conversationId] || []), newMessage],
      };

      const updatedConversations = conversations.map(c =>
        c.id === conversationId
          ? { ...c, lastActivity: new Date().toISOString(), lastMessage: newMessage }
          : c
      );

      setMessages(updatedMessages);
      setConversations(updatedConversations);
      saveToLocalStorage();
    }
  };

  const createConversation = async (participantId: string, title?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check if conversation already exists
    const existingConversation = conversations.find(c =>
      c.participants.includes(user.id) &&
      c.participants.includes(participantId)
    );

    if (existingConversation) return existingConversation.id;

    try {
      // Try to create conversation via API
      const response = await axios.post(`${API_URL}/conversations`, {
        participants: [user.id, participantId],
        title
      });

      const newConversation: Conversation = response.data;

      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);
      saveToLocalStorage();

      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation via API:', error);

      // Fallback to local state update if API fails
      const newConversation: Conversation = {
        id: 'conv_' + Math.random().toString(36).substring(2, 9),
        participants: [user.id, participantId],
        title,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);
      saveToLocalStorage();

      return newConversation.id;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    const conversationMessages = messages[conversationId];
    if (!conversationMessages) return;

    try {
      // Try to mark messages as read via API
      await axios.put(`${API_URL}/conversations/${conversationId}/read`, {
        userId: user.id
      });

      // Update local state regardless of API success
      const updatedConversationMessages = conversationMessages.map(msg =>
        msg.receiverId === user.id && !msg.isRead
          ? { ...msg, isRead: true }
          : msg
      );

      const updatedMessages = {
        ...messages,
        [conversationId]: updatedConversationMessages,
      };

      setMessages(updatedMessages);
      saveToLocalStorage();
    } catch (error) {
      console.error('Error marking messages as read via API:', error);

      // Fallback to just updating local state if API fails
      const updatedConversationMessages = conversationMessages.map(msg =>
        msg.receiverId === user.id && !msg.isRead
          ? { ...msg, isRead: true }
          : msg
      );

      const updatedMessages = {
        ...messages,
        [conversationId]: updatedConversationMessages,
      };

      setMessages(updatedMessages);
      saveToLocalStorage();
    }
  };

  const getConversationMessages = (conversationId: string) => {
    return messages[conversationId] || [];
  };

  const getConversation = (conversationId: string) => {
    return conversations.find(c => c.id === conversationId);
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        unreadCount,
        sendMessage,
        createConversation,
        markAsRead,
        getConversationMessages,
        getConversation,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
