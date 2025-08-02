import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Square, MessageSquare } from 'lucide-react';

interface DialogueMessage {
  speaker: string;
  content: string;
  timestamp: Date;
}

const AI_MODELS = [
  { name: 'GROK', color: 'text-grok', badge: 'bg-grok/10 text-grok border-grok/20' },
  { name: 'CLAUDE', color: 'text-claude', badge: 'bg-claude/10 text-claude border-claude/20' },
  { name: 'CHATGPT', color: 'text-chatgpt', badge: 'bg-chatgpt/10 text-chatgpt border-chatgpt/20' },
  { name: 'DEEPSEEK', color: 'text-deepseek', badge: 'bg-deepseek/10 text-deepseek border-deepseek/20' }
];

export default function DebateTerminal() {
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dialogue]);

  const addMessage = async (speaker: string, content: string) => {
    const message: DialogueMessage = {
      speaker,
      content,
      timestamp: new Date()
    };

    setDialogue(prev => [...prev, message]);
    
    // Simulate typing effect
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    setIsTyping(false);
  };

  const getAIResponse = async (prompt: string, sessionId: string | null, isNewSession = false) => {
    // For demo purposes, we'll use mock responses
    // In production, this would call your actual API endpoints
    try {
      const { mockApi } = await import('@/lib/mockApi');
      return await mockApi.simulateApiCall(prompt, sessionId, isNewSession);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const startConversation = async () => {
    if (!prompt.trim()) return;

    setIsRunning(true);
    setDialogue([]);
    setTurnCount(0);
    setCurrentSessionId(null);

    try {
      // Initialize with Grok's response
      const initResult = await getAIResponse(prompt, null, true);
      
      if (!initResult.success) throw new Error(initResult.error || 'Failed to start conversation');

      const sessionId = initResult.sessionId;
      setCurrentSessionId(sessionId);
      await addMessage('GROK', prompt);

      // Continue conversation loop
      let count = 0;
      const runConversationLoop = async () => {
        while (isRunning && count < 50) {
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!isRunning) break; // Check if stopped
            
            const result = await getAIResponse(prompt, sessionId, false);
            if (!result.success) {
              console.error('API Error:', result.error);
              continue;
            }

            await addMessage(result.aiModel, result.response);
            count++;
            setTurnCount(count);
          } catch (error) {
            console.error('Turn error:', error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
        setIsRunning(false);
      };

      // Start the conversation loop
      runConversationLoop();
    } catch (error) {
      console.error('Conversation error:', error);
      setIsRunning(false);
    }
  };

  const stopConversation = () => {
    setIsRunning(false);
  };

  const getModelStyle = (speaker: string) => {
    const model = AI_MODELS.find(m => m.name === speaker);
    return model || { name: speaker, color: 'text-foreground', badge: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-light mb-4 text-foreground">
          debateterminal
        </h1>
        <p className="text-muted-foreground text-lg">
          AI Models Debate in Real-time
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Search Input */}
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything or start a debate..."
              className="pl-12 pr-32 py-6 text-lg bg-card border-border rounded-2xl focus:ring-primary focus:border-primary"
              onKeyPress={(e) => e.key === 'Enter' && !isRunning && startConversation()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {!isRunning ? (
                <Button
                  onClick={startConversation}
                  disabled={!prompt.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={stopConversation}
                  variant="destructive"
                  className="rounded-xl px-6"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Category Buttons (Similar to Perplexity) */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button variant="secondary" className="rounded-full px-6 py-2">
            <MessageSquare className="h-4 w-4 mr-2" />
            Debate
          </Button>
          <Button variant="secondary" className="rounded-full px-6 py-2">
            Philosophy
          </Button>
          <Button variant="secondary" className="rounded-full px-6 py-2">
            Technology
          </Button>
          <Button variant="secondary" className="rounded-full px-6 py-2">
            Science
          </Button>
          <Button variant="secondary" className="rounded-full px-6 py-2">
            Politics
          </Button>
        </div>

        {/* Status */}
        {isRunning && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                Turn {turnCount} - {isTyping ? 'AI typing...' : 'Getting response...'}
              </span>
            </div>
          </div>
        )}

        {/* Conversation Display */}
        {dialogue.length > 0 && (
          <Card className="bg-card border-border rounded-2xl overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto p-6 space-y-6">
              {dialogue.map((message, index) => {
                const modelStyle = getModelStyle(message.speaker);
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={modelStyle.badge}>
                        {message.speaker}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`prose prose-invert max-w-none ${modelStyle.color}`}>
                      <p className="leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">AI is responding...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </Card>
        )}

        {/* Empty State */}
        {dialogue.length === 0 && !isRunning && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-2xl mx-auto flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">Start a Debate</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a topic or question above to watch AI models debate in real-time. 
              Grok, Claude, ChatGPT, and DeepSeek will engage in intelligent discourse.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}