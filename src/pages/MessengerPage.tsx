import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMessages } from '../context/MessageContext';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Send, Clock, Check, ChevronLeft, Calendar, MessageSquare, Search, Paperclip, X, Download, FileText, Image, File } from 'lucide-react';

const MessengerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useUser();
  const {
    conversations,
    getConversationMessages,
    getConversation,
    sendMessage,
    markAsRead,
    createConversation
  } = useMessages();

  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Mock client data (in a real app, this would come from API)
  const clientData: Record<string, { name: string; avatar?: string }> = {
    client_1: {
      name: 'Jean Dupont',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    client_2: {
      name: 'Sophie Martin',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    client_3: {
      name: 'Marc Lefevre',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/messenger' } });
      return;
    }

    // Mark messages as read when opening conversation
    const readMessages = async () => {
      if (activeConversationId) {
        await markAsRead(activeConversationId);
      }
    };

    const loadData = async () => {
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      await readMessages();
    };

    loadData();

    // If URL has conversation ID, set it as active
    if (id && id !== activeConversationId) {
      setActiveConversationId(id);
    }
  }, [activeConversationId, id, isAuthenticated, markAsRead, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change or active conversation changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [getConversationMessages, activeConversationId]);

  const activeConversation = activeConversationId ? getConversation(activeConversationId) : undefined;
  const messages = activeConversationId ? getConversationMessages(activeConversationId) : [];

  const getClientInfo = (participantIds: string[]) => {
    if (!user) return { name: 'Unknown', avatar: undefined };

    const clientId = participantIds.find(id => id !== user.id);
    if (!clientId) return { name: 'Unknown', avatar: undefined };

    return clientData[clientId] || { name: 'Unknown', avatar: undefined };
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClickAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeConversationId || (!newMessage.trim() && selectedFiles.length === 0)) return;

    setIsSending(true);
    try {
      await sendMessage(activeConversationId, newMessage.trim(), selectedFiles);
      setNewMessage('');
      setSelectedFiles([]);
      // Update the URL to match the active conversation
      if (id !== activeConversationId) {
        navigate(`/messenger/${activeConversationId}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);

    // If it's today, show the time, otherwise show the date and time
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
    navigate(`/messenger/${conversationId}`);
  };

  const getLastMessagePreview = (conversationId: string) => {
    const conversationMessages = getConversationMessages(conversationId);
    if (!conversationMessages || conversationMessages.length === 0) return 'Aucun message';

    const lastMessage = conversationMessages[conversationMessages.length - 1];

    // If has attachments, show that instead
    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      return `📎 ${lastMessage.attachments.length > 1 ? 'Fichiers joints' : 'Fichier joint'}`;
    }

    return lastMessage.content.length > 25
      ? `${lastMessage.content.substring(0, 25)}...`
      : lastMessage.content;
  };

  const getLastMessageTimestamp = (conversationId: string) => {
    const conversationMessages = getConversationMessages(conversationId);
    if (!conversationMessages || conversationMessages.length === 0) return '';

    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const date = new Date(lastMessage.timestamp);

    // If it's today, show the time, otherwise show the date
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getUnreadCountForConversation = (conversationId: string) => {
    if (!user) return 0;

    const conversationMessages = getConversationMessages(conversationId);
    if (!conversationMessages) return 0;

    return conversationMessages.filter(
      msg => msg.receiverId === user.id && !msg.isRead
    ).length;
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="text-workit-purple" size={20} />;
    } else if (mimetype === 'application/pdf') {
      return <FileText className="text-red-500" size={20} />;
    } else if (mimetype.includes('word')) {
      return <FileText className="text-blue-500" size={20} />;
    } else if (mimetype === 'text/plain') {
      return <FileText className="text-gray-400" size={20} />;
    } else {
      return <File className="text-gray-400" size={20} />;
    }
  };

  const renderAttachment = (attachment: any) => {
    const isImage = attachment.mimetype.startsWith('image/');

    return (
      <div key={attachment.filename} className="my-2">
        {isImage ? (
          <a href={attachment.path} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={attachment.path}
              alt={attachment.originalName}
              className="max-w-[200px] max-h-[200px] rounded-md object-contain cursor-pointer hover:opacity-90 transition"
            />
            <div className="text-xs mt-1 text-gray-300">{attachment.originalName}</div>
          </a>
        ) : (
          <a
            href={attachment.path}
            download={attachment.originalName}
            className="flex items-center p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
          >
            {getFileIcon(attachment.mimetype)}
            <span className="ml-2 text-sm truncate max-w-[150px]">{attachment.originalName}</span>
            <Download size={16} className="ml-auto text-gray-300" />
          </a>
        )}
      </div>
    );
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm.trim()) return true;

    const client = getClientInfo(conversation.participants);
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-workit-purple"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/messenger' } });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messagerie</h1>
        <p className="text-gray-400">Consultez et gérez vos conversations</p>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-14rem)]">
          {/* Conversation List - Left Panel */}
          <div className="md:col-span-1 border-r border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-workit-purple"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-70px)]">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-white font-medium mb-1">Aucune conversation</h3>
                  <p className="text-gray-400">
                    {searchTerm
                      ? "Aucune conversation trouvée pour cette recherche."
                      : "Vous n'avez pas encore de messages. Commencez par contacter un vendeur."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredConversations.map((conversation) => {
                    const client = getClientInfo(conversation.participants);
                    const unreadCount = getUnreadCountForConversation(conversation.id);
                    const isActive = conversation.id === activeConversationId;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                        className={`flex items-center p-4 w-full text-left transition ${
                          isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex-shrink-0 relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute top-0 right-0 w-4 h-4 bg-workit-purple rounded-full flex items-center justify-center text-white text-xs">
                              {unreadCount}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`font-medium truncate ${isActive ? 'text-workit-purple' : 'text-white'}`}>
                              {client.name}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {getLastMessageTimestamp(conversation.id)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                              {getLastMessagePreview(conversation.id)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Message Area - Right Panel */}
          <div className="md:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-800 flex items-center">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      {getClientInfo(activeConversation.participants).avatar ? (
                        <img
                          src={getClientInfo(activeConversation.participants).avatar}
                          alt={getClientInfo(activeConversation.participants).name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
                          {getClientInfo(activeConversation.participants).name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {getClientInfo(activeConversation.participants).name}
                      </h3>
                      {activeConversation.title && (
                        <div className="text-gray-400 text-sm">
                          {activeConversation.title}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <MessageSquare size={48} className="text-gray-600 mb-4" />
                      <p className="text-center">Aucun message dans cette conversation. <br />Envoyez un message pour commencer.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = user && message.senderId === user.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="max-w-[75%]">
                              <div
                                className={`rounded-lg px-4 py-3 ${
                                  isOwn
                                    ? 'bg-workit-purple text-white'
                                    : 'bg-gray-800 text-gray-200'
                                }`}
                              >
                                {message.content && (
                                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                )}

                                {message.attachments && message.attachments.length > 0 && (
                                  <div className={message.content ? 'mt-3' : ''}>
                                    {message.attachments.map((attachment) => renderAttachment(attachment))}
                                  </div>
                                )}
                              </div>
                              <div
                                className={`flex items-center mt-1 text-xs ${
                                  isOwn ? 'justify-end text-gray-400' : 'justify-start text-gray-500'
                                }`}
                              >
                                <span>{formatMessageTime(message.timestamp)}</span>
                                {isOwn && (
                                  <span className="ml-2 flex items-center">
                                    {message.isRead ? (
                                      <Check size={14} className="text-workit-purple" />
                                    ) : (
                                      <Clock size={14} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800">
                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="bg-gray-800 rounded-md p-2 flex items-center">
                          {file.type.startsWith('image/') ? (
                            <Image size={16} className="text-workit-purple mr-2" />
                          ) : (
                            <FileText size={16} className="text-workit-purple mr-2" />
                          )}
                          <span className="text-sm text-gray-300 truncate max-w-[120px]">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="ml-2 text-gray-500 hover:text-gray-300"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Votre message..."
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-md text-white focus:outline-none focus:border-workit-purple"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                    />
                    <button
                      type="button"
                      onClick={handleClickAttachment}
                      className="px-3 py-3 bg-gray-800 border-t border-b border-r border-gray-700 text-gray-400 hover:text-workit-purple transition disabled:opacity-50"
                      disabled={isSending}
                    >
                      <Paperclip size={20} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*,.pdf,.doc,.docx,text/plain"
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-workit-purple text-white rounded-r-md hover:bg-workit-purple-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSending || (!newMessage.trim() && selectedFiles.length === 0)}
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare size={48} className="text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Vos Messages</h2>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  Sélectionnez une conversation dans la liste ou commencez une nouvelle conversation avec un vendeur.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessengerPage;
