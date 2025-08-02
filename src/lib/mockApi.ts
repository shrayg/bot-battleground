// Mock API responses for demonstration
const AI_RESPONSES = {
  GROK: [
    "Interesting perspective! Let me challenge that assumption with some data...",
    "I appreciate the nuanced take here, but consider this counterpoint...",
    "That's a fascinating angle. Here's what the latest research suggests...",
    "While I understand that viewpoint, there's another way to look at this...",
    "The evidence actually points in a different direction. Let me explain..."
  ],
  CLAUDE: [
    "I find myself both agreeing and disagreeing with the previous points...",
    "There's wisdom in what's been said, though I'd like to add some context...",
    "The complexity of this issue requires us to consider multiple dimensions...",
    "I appreciate the thoughtful discourse. Here's my contribution to the discussion...",
    "Building on those insights, I think we should also consider..."
  ],
  CHATGPT: [
    "Great discussion so far! I'd like to offer a different perspective...",
    "The points raised are valid, but there's another layer to consider...",
    "This is exactly the kind of nuanced debate we need. My take is...",
    "I see merit in all these viewpoints. Let me synthesize and add...",
    "The conversation has evolved beautifully. Here's what I think..."
  ],
  DEEPSEEK: [
    "Analyzing the logical structure of these arguments, I notice...",
    "From a systematic perspective, we should examine the underlying assumptions...",
    "The pattern of reasoning here suggests we might be missing...",
    "Let me approach this from a more analytical angle...",
    "The data underlying these positions tells an interesting story..."
  ]
};

const AI_MODELS = ['GROK', 'CLAUDE', 'CHATGPT', 'DEEPSEEK'] as const;

export class MockDebateApi {
  private currentModelIndex = 0;
  private responseIndex = 0;
  private sessionDialogue: string[] = [];

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async simulateApiCall(prompt: string, sessionId: string | null, isNewSession = false) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    try {
      if (isNewSession) {
        this.sessionDialogue = [`GROK: ${prompt}`];
        this.currentModelIndex = 1; // Start with Claude next
        this.responseIndex = 0;
        
        return {
          success: true,
          sessionId: this.generateSessionId(),
          dialogue: this.sessionDialogue,
          aiModel: 'GROK',
          response: prompt,
          error: null
        };
      }

      // Get current AI model
      const currentModel = AI_MODELS[this.currentModelIndex];
      const responses = AI_RESPONSES[currentModel];
      
      // Get response (cycle through available responses)
      const response = responses[this.responseIndex % responses.length];
      
      // Add to dialogue
      this.sessionDialogue.push(`${currentModel}: ${response}`);
      
      // Move to next model and response
      this.currentModelIndex = (this.currentModelIndex + 1) % AI_MODELS.length;
      this.responseIndex++;

      return {
        success: true,
        sessionId,
        dialogue: this.sessionDialogue,
        aiModel: currentModel,
        response,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        sessionId: null,
        dialogue: [],
        aiModel: '',
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const mockApi = new MockDebateApi();