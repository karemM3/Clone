import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: {
    id: string;
    type: 'image' | 'file' | 'link';
    url: string;
    name?: string;
  }[];
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  title?: string; // Title for the conversation (e.g., service name)
  isTyping?: {
    userId: string;
    timestamp: number;
  };
}

export interface MessageNotification {
  id: string;
  conversationId: string;
  message: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // Key is conversationId
  unreadCount: number;
  notifications: MessageNotification[];
  sendMessage: (conversationId: string, content: string, attachments?: any[]) => Promise<void>;
  createConversation: (participantId: string, title?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getConversation: (conversationId: string) => Conversation | undefined;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
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
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);

  // Clear typing status after 5 seconds of inactivity
  const TYPING_TIMEOUT = 5000;

  useEffect(() => {
    // Load conversations and messages from localStorage
    const storedConversations = localStorage.getItem('workit_conversations');
    const storedMessages = localStorage.getItem('workit_messages');
    const storedNotifications = localStorage.getItem('workit_message_notifications');

    if (storedConversations) {
      try {
        const parsedConversations = JSON.parse(storedConversations);
        setConversations(parsedConversations);
      } catch (error) {
        console.error('Error parsing stored conversations:', error);
        localStorage.removeItem('workit_conversations');
      }
    } else {
      // Initialize with mock data for demo purposes
      initializeMockData();
    }

    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing stored messages:', error);
        localStorage.removeItem('workit_messages');
      }
    }

    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
        localStorage.removeItem('workit_message_notifications');
      }
    }

    // Check for expired typing indicators
    const checkTypingStatus = setInterval(() => {
      const now = Date.now();
      setConversations(prev =>
        prev.map(conv => {
          if (conv.isTyping && now - conv.isTyping.timestamp > TYPING_TIMEOUT) {
            // Clear typing indicator
            const { isTyping, ...rest } = conv;
            return rest;
          }
          return conv;
        })
      );
    }, 1000);

    return () => clearInterval(checkTypingStatus);
  }, []);

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
      },
      {
        id: 'conv_2',
        participants: [user.id, 'client_2'],
        title: 'Création de Logo',
      },
      {
        id: 'conv_3',
        participants: [user.id, 'client_3'],
        title: 'Développement d\'API',
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
          attachments: [
            {
              id: 'att_1',
              type: 'file',
              url: 'https://example.com/api-specs.pdf',
              name: 'API Specifications.pdf'
            }
          ]
        },
      ],
    };

    // Create mock notifications
    const mockNotifications: MessageNotification[] = [
      {
        id: 'notif_1',
        conversationId: 'conv_1',
        message: 'Jean Dupont vous a envoyé un message',
        sender: 'client_1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: false
      },
      {
        id: 'notif_2',
        conversationId: 'conv_3',
        message: 'Marc Lefevre vous a envoyé un message',
        sender: 'client_3',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        isRead: false
      }
    ];

    setConversations(mockConversations);
    setMessages(mockMessages);
    setNotifications(mockNotifications);

    localStorage.setItem('workit_conversations', JSON.stringify(mockConversations));
    localStorage.setItem('workit_messages', JSON.stringify(mockMessages));
    localStorage.setItem('workit_message_notifications', JSON.stringify(mockNotifications));
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('workit_conversations', JSON.stringify(conversations));
    localStorage.setItem('workit_messages', JSON.stringify(messages));
    localStorage.setItem('workit_message_notifications', JSON.stringify(notifications));
  };

  const sendMessage = async (conversationId: string, content: string, attachments?: any[]) => {
    if (!user) return;

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const receiverId = conversation.participants.find(id => id !== user.id) || '';

    const newMessage: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId: user.id,
      receiverId,
      conversationId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      attachments: attachments?.map(att => ({
        id: 'att_' + Math.random().toString(36).substring(2, 9),
        ...att
      }))
    };

    const updatedMessages = {
      ...messages,
      [conversationId]: [...(messages[conversationId] || []), newMessage],
    };

    // Update the conversation with latest message
    const updatedConversations = conversations.map(c =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: newMessage,
            // Clear typing indicator when sending a message
            isTyping: undefined
          }
        : c
    );

    setMessages(updatedMessages);
    setConversations(updatedConversations);

    // Simulate server response with a small delay
    setTimeout(() => {
      // In a real app, this would be received from the server
      const simulateResponse = Math.random() > 0.7;

      if (simulateResponse) {
        const responseContent = ['Merci pour votre message.', 'Je vais étudier votre demande.', 'Votre message a bien été reçu.', 'Je reviens vers vous rapidement.'];
        const randomResponse = responseContent[Math.floor(Math.random() * responseContent.length)];

        const responseMessage: Message = {
          id: 'msg_' + Math.random().toString(36).substring(2, 9),
          senderId: receiverId,
          receiverId: user.id,
          conversationId,
          content: randomResponse,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        const updatedWithResponse = {
          ...updatedMessages,
          [conversationId]: [...updatedMessages[conversationId], responseMessage],
        };

        // Update conversation with response as last message
        const conversationsWithResponse = updatedConversations.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: responseMessage }
            : c
        );

        // Create notification for the simulated response
        const newNotification: MessageNotification = {
          id: 'notif_' + Math.random().toString(36).substring(2, 9),
          conversationId,
          message: `Vous avez reçu un nouveau message`,
          sender: receiverId,
          timestamp: new Date().toISOString(),
          isRead: false
        };

        setMessages(updatedWithResponse);
        setConversations(conversationsWithResponse);
        setNotifications(prev => [...prev, newNotification]);

        // Save updates
        localStorage.setItem('workit_conversations', JSON.stringify(conversationsWithResponse));
        localStorage.setItem('workit_messages', JSON.stringify(updatedWithResponse));
        localStorage.setItem('workit_message_notifications', JSON.stringify([...notifications, newNotification]));
      }
    }, 3000 + Math.random() * 7000); // Random delay between 3-10 seconds

    saveToLocalStorage();
  };

  const createConversation = async (participantId: string, title?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check if conversation already exists
    const existingConversation = conversations.find(c =>
      c.participants.includes(user.id) &&
      c.participants.includes(participantId)
    );

    if (existingConversation) return existingConversation.id;

    const newConversation: Conversation = {
      id: 'conv_' + Math.random().toString(36).substring(2, 9),
      participants: [user.id, participantId],
      title,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    saveToLocalStorage();

    return newConversation.id;
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    const conversationMessages = messages[conversationId];
    if (!conversationMessages) return;

    const updatedConversationMessages = conversationMessages.map(msg =>
      msg.receiverId === user.id && !msg.isRead
        ? { ...msg, isRead: true }
        : msg
    );

    const updatedMessages = {
      ...messages,
      [conversationId]: updatedConversationMessages,
    };

    // Mark related notifications as read
    const updatedNotifications = notifications.map(notif =>
      notif.conversationId === conversationId && !notif.isRead
        ? { ...notif, isRead: true }
        : notif
    );

    setMessages(updatedMessages);
    setNotifications(updatedNotifications);
    saveToLocalStorage();
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId
        ? { ...notif, isRead: true }
        : notif
    );

    setNotifications(updatedNotifications);
    localStorage.setItem('workit_message_notifications', JSON.stringify(updatedNotifications));
  };

  const getConversationMessages = (conversationId: string) => {
    return messages[conversationId] || [];
  };

  const getConversation = (conversationId: string) => {
    return conversations.find(c => c.id === conversationId);
  };

  const setTypingStatus = (conversationId: string, isTyping: boolean) => {
    if (!user) return;

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        if (isTyping) {
          return {
            ...conv,
            isTyping: {
              userId: user.id,
              timestamp: Date.now()
            }
          };
        } else {
          // Clear typing status
          const { isTyping: _, ...rest } = conv;
          return rest;
        }
      }
      return conv;
    }));

    // Save to localStorage
    localStorage.setItem('workit_conversations', JSON.stringify(conversations));
  };

  const deleteConversation = async (conversationId: string) => {
    // Remove conversation
    const updatedConversations = conversations.filter(c => c.id !== conversationId);

    // Remove all messages for this conversation
    const { [conversationId]: deletedMessages, ...updatedMessages } = messages;

    // Remove related notifications
    const updatedNotifications = notifications.filter(n => n.conversationId !== conversationId);

    setConversations(updatedConversations);
    setMessages(updatedMessages);
    setNotifications(updatedNotifications);
    saveToLocalStorage();
  };

  const deleteMessage = async (conversationId: string, messageId: string) => {
    if (!messages[conversationId]) return;

    // Filter out the deleted message
    const updatedConversationMessages = messages[conversationId].filter(msg => msg.id !== messageId);

    // Update messages
    const updatedMessages = {
      ...messages,
      [conversationId]: updatedConversationMessages
    };

    // If we deleted the last message, update the conversation's lastMessage
    const lastMessage = updatedConversationMessages.length > 0
      ? updatedConversationMessages[updatedConversationMessages.length - 1]
      : undefined;

    const updatedConversations = conversations.map(c =>
      c.id === conversationId
        ? { ...c, lastMessage }
        : c
    );

    setMessages(updatedMessages);
    setConversations(updatedConversations);
    saveToLocalStorage();
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        unreadCount,
        notifications,
        sendMessage,
        createConversation,
        markAsRead,
        markNotificationAsRead,
        getConversationMessages,
        getConversation,
        setTypingStatus,
        deleteConversation,
        deleteMessage
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
