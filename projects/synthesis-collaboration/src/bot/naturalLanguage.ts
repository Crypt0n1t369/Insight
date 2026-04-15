/**
 * Natural Language Intent Parser
 * Detects user intent from free-form text without strict command prefixes.
 * Uses keyword matching — no external NLP API needed.
 */

type Intent = {
  handler: 'newproject' | 'definechallenge' | 'insight' | 'generate' | 'status'
           | 'myinsights' | 'confirm' | 'ready' | 'help' | 'menu' | 'link' | 'unknown';
  confidence: number; // 0-1
  args?: string;
  reply?: string;
};

const GREETING_PATTERNS = [
  /^(hi|hey|hello|yo|sup|hiya|greetings)/i,
  /^good (morning|afternoon|evening)/i,
];

const HELP_PATTERNS = [
  /^(what(('s| is| are)?)? )?(can you |how |how can I )?(do|help|use)/i,
  /^(what|how) (can|does) this (do|bot|channel)/i,
  /^commands?$/i,
  /^help$/i,
  /^(show |list )?(commands?|menu|options)/i,
  /^how (can|do|should) (you|i|we)/i,
  /^what (can|do) (you|i|we)/i,
  /^(can|could) you (help|do)/i,
  /what('s| is) your purpose/i,
  /who are you/i,
  /what are you/i,
];

const NEWPROJECT_PATTERNS = [
  /^(let'?s? |we |)(start|create|begin|make|new)(ing)? (a )?project/i,
  /^(start|create|begin|make|new)(ing)? (a )?project/i,
  /^new project/i,
  /^(start|create) something( new)?/i,
  /^i want to (work on|start|create)/i,
  /^let'?s? (tackle|work on|explore)/i,
];

const DEFINECHALLENGE_PATTERNS = [
  /^the (challenge|question|problem) (is|we face|we'?re tackling):?/i,
  /^(our )?(challenge|question|goal|focus) (is|would be|should be):?/i,
  /^(define|set|write)(ing)? (the )?challenge/i,
  /^the (main |big |core )?(issue|question|problem) (we'?re|i'?m|i am) (looking at|solving|working on|exploring):?/i,
  /^we('re| are)? (trying to|working on|exploring)/i,
  /^how (can|do|should) we/i,
];

const INSIGHT_PATTERNS = [
  /^(i think|i believe|my take|here'?s? |maybe|perhaps|from my perspective)/i,
  /^(add|stores?|log|record|capture)(ing)? (my )?(insight|thought|idea|note)/i,
  /^(insight|thought|idea|note):/i,
  /^(here'?s?|here is) (my |a )?(insight|thought|idea)/i,
  /^one (more )?(thing|point|insight|idea)/i,
];

const GENERATE_PATTERNS = [
  /^(generate|synthesize|create|make|produce)(ing)? (a )?(synthesis|summary|output)/i,
  /^(let'?s? |time to |)(wrap up|conclude|wrap it up|wrap this)/i,
  /^(generate|synthesize|summary|synthesize) now/i,
  /^(done|finished|complete)( with( the)? contributions)?/i,
  /^(create|make|generate) (the |a )?report/i,
  /^put it (all|together)/i,
];

const STATUS_PATTERNS = [
  /^(what('s| is)?)? (the )?(status|state|progress)/i,
  /^how('s| is| are) (we|things|it) (going|doing)/i,
  /^(where|how) (are we|i am) (at|now)/i,
  /^show me (the )?(status|progress|state)/i,
  /^what do we have so far/i,
  /^(any |how many )?(insights|contributions)/i,
];

const MYINSIGHTS_PATTERNS = [
  /^(show|list|view|display|get)(ing)? (my |all )?(insights|thoughts|ideas|contributions)/i,
  /^what (have I|do I have|i('ve)?) (contributed|added|shared)/i,
  /^my (insights|contributions|ideas|thoughts)/i,
  /^show (me )?(what i('ve)?|my) (added|shared|contributed)/i,
];

const READY_PATTERNS = [
  /^(i('m| am)|we('re| are)) (done|ready|finished)/i,
  /^(i|we)('ve)? (finished|done|completed)/i,
  /^(mark|set)(ing)? (me|us) (as )?(ready|done)/i,
  /^ready now/i,
  /^i('m| am) (all )?set/i,
];

const CONFIRM_PATTERNS = [
  /^(approve|confirm|accept|validate)(ing)? (this |the )?(insight|contribution)/i,
  /^this (insight|idea|contribution) (looks|is) good/i,
  /^(confirm|approve|accept) this/i,
];

const LINK_PATTERNS = [
  /^link(ing)? (this |the )?(group|chat)( to)?/i,
  /^(connect|attach)(ing)? (this |the )?(group|chat)/i,
  /^connect (this |the )?(group|chat) (to|with)/i,
  /^add (this |the )?(group|chat) (to|with)/i,
];

const MENU_PATTERNS = [
  /^menu$/i,
  /^commands$/i,
  /^show (me )?(the )?(menu|commands|options)/i,
  /^(what|show) (can i do|can i use|are my options)/i,
];

/**
 * Parse free-form text and detect intent.
 * Returns intent with confidence score and extracted arguments.
 */
export function parseNaturalLanguage(text: string): Intent {
  const normalized = text.trim();

  // Exact command prefix — treat as command
  if (normalized.startsWith('/')) {
    const cmd = normalized.slice(1).split(' ')[0].toLowerCase();
    if (['newproject', 'definechallenge', 'insight', 'generate', 'status',
         'myinsights', 'confirm', 'ready', 'menu', 'link'].includes(cmd)) {
      return { handler: cmd as Intent['handler'], confidence: 1.0 };
    }
    return { handler: 'unknown', confidence: 0.5 };
  }

  // Greetings
  if (GREETING_PATTERNS.some(p => p.test(normalized))) {
    return {
      handler: 'help',
      confidence: 0.9,
      reply: `👋 Hey! I'm *Synthesis* — a collaborative intelligence bot.\n\n` +
             `I help groups share insights, synthesize ideas, and turn collective thinking into action.\n\n` +
             `*Get started:* /newproject <name>\n` +
             `*In groups:* /insight <your thought>\n` +
             `*Any time:* /menu to see all commands`,
    };
  }

  // Help
  for (const pattern of HELP_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'help', confidence: 0.95 };
    }
  }

  // New project
  for (const pattern of NEWPROJECT_PATTERNS) {
    if (pattern.test(normalized)) {
      const name = normalized
        .replace(/^(let'?s? |we |start|create|begin|make|new|ing|starting|creating|beginning|making)/i, '')
        .replace(/^(a |an )?(project)/i, '')
        .trim();
      return {
        handler: 'newproject',
        confidence: 0.85,
        args: name.length > 1 ? name : '',
      };
    }
  }

  // Define challenge
  for (const pattern of DEFINECHALLENGE_PATTERNS) {
    if (pattern.test(normalized)) {
      const challenge = normalized
        .replace(/^(the |our )?(challenge|question|goal|focus|issue|problem|main |big |core )?(is|we face|we'?re tackling|would be|should be|we('re| are)? (trying to|working on|exploring)|(can|do|should) we)/i, '')
        .replace(/^how (can|do|should) we/i, '')
        .trim();
      return {
        handler: 'definechallenge',
        confidence: 0.8,
        args: challenge.length > 3 ? challenge : normalized,
      };
    }
  }

  // Insight
  for (const pattern of INSIGHT_PATTERNS) {
    if (pattern.test(normalized)) {
      const insight = normalized
        .replace(/^(i think|i believe|my take|here'?s?|here is|maybe|perhaps|from my perspective|one (more )?(thing|point|insight|idea)|add|stores?|log|record|capture)(ing)? (my )?(insight|thought|idea|note)?:?\s*/i, '')
        .trim();
      return {
        handler: 'insight',
        confidence: 0.8,
        args: insight.length > 2 ? insight : normalized,
      };
    }
  }

  // Generate / Synthesize
  for (const pattern of GENERATE_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'generate', confidence: 0.85 };
    }
  }

  // Status / Progress
  for (const pattern of STATUS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'status', confidence: 0.8 };
    }
  }

  // My insights
  for (const pattern of MYINSIGHTS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'myinsights', confidence: 0.85 };
    }
  }

  // Ready
  for (const pattern of READY_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'ready', confidence: 0.8 };
    }
  }

  // Confirm
  for (const pattern of CONFIRM_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'confirm', confidence: 0.75 };
    }
  }

  // Link group
  for (const pattern of LINK_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'link', confidence: 0.8 };
    }
  }

  // Menu
  for (const pattern of MENU_PATTERNS) {
    if (pattern.test(normalized)) {
      return { handler: 'menu', confidence: 0.95 };
    }
  }

  return { handler: 'unknown', confidence: 0 };
}

/**
 * Returns the appropriate menu text based on chat context.
 */
export function getMenuForContext(isDm: boolean, projectLinked: boolean): string {
  if (isDm) {
    return `📋 *Your Commands*\n\n` +
           `*Projects:*\n` +
           `/newproject <name> — Start a new project\n` +
           `/definechallenge <statement> — Set the challenge\n` +
           `/link <group-id> — Link a Telegram group\n\n` +
           `*Insights:*\n` +
           `/myinsights — View your contributions\n` +
           `/confirm <id> — Approve an insight\n\n` +
           `*Status:*\n` +
           `/ready — Signal you're done contributing\n` +
           `/status — Full project status\n` +
           `/menu — Show this menu`;
  } else {
    return `📋 *Group Commands*\n\n` +
           `*Contribute:*\n` +
           `/insight <your thought> — Share an insight\n\n` +
           `*Synthesize:*\n` +
           `/generate — Trigger synthesis (when ready)\n` +
           `/status — View project progress\n\n` +
           `*Context:*\n` +
           `Insights from all members build toward synthesis.\n` +
           `/menu — Show full command list`;
  }
}

/**
 * Returns suggested next action based on project state.
 */
export function getSuggestedNextAction(state: {
  hasProject: boolean;
  hasChallenge: boolean;
  hasContributions: boolean;
  isDm: boolean;
  readyCount: number;
  totalContributors: number;
}): string | null {
  if (!state.isDm) {
    if (!state.hasContributions) {
      return `💡 Try sharing your first insight: /insight <your thought>`;
    }
    if (state.readyCount > 0 && state.readyCount < state.totalContributors) {
      return `👍 ${state.readyCount}/${state.totalContributors} ready — type /ready when done or /generate to synthesize now`;
    }
    if (state.hasContributions) {
      return `🧠 Type /generate when everyone is ready to synthesize`;
    }
    return null;
  }

  if (!state.hasProject) {
    return `🚀 Start your first project: /newproject <name>`;
  }
  if (!state.hasChallenge) {
    return `🎯 Next: /definechallenge <your challenge>`;
  }
  if (!state.hasContributions) {
    return `💡 Share insights in your group using /insight <thought>`;
  }
  return `✅ Everything is set — contribute in the group or type /status to check progress`;
}
