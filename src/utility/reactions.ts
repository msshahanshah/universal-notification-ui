import emoji from 'emoji-dictionary';

/**
 * Converts reaction names to emoji characters
 * @param reactionName - The reaction name (e.g., 'thumbsup', 'white_check_mark')
 * @returns The corresponding emoji character or the original name if not found
 */
export const getReactionEmoji = (reactionName: string): string => {
  // Ensure we have a string, fallback to empty string if not
  const safeReactionName = typeof reactionName === 'string' ? reactionName : String(reactionName || '');
  
  if (!safeReactionName.trim()) {
    return reactionName || '';
  }
  
  const emojiChar = emoji.getUnicode(safeReactionName);
  
  return emojiChar || reactionName;
};

/**
 * Converts an array of reaction names to a string of emoji characters
 * @param reactions - Array of reaction names
 * @returns String of emoji characters separated by spaces
 */
export const getReactionsEmoji = (reactions: string[]): string => {
  if (!reactions || reactions.length === 0) {
    return '';
  }
  
  return reactions
    .map(reaction => getReactionEmoji(String(reaction || '')))
    .filter(emoji => emoji && emoji.trim()) // Filter out empty results
    .join(', ');
};

/**
 * Formats user replied messages for display
 * @param userRepliedMessages - Array of user replied message objects
 * @returns Formatted string of reactions or "No reactions"
 */
export const formatUserReactions = (userRepliedMessages?: { reactions: string }[]): string => {
  if (!userRepliedMessages || userRepliedMessages.length === 0) {
    return '-';
  }
  
  const allReactions = userRepliedMessages
    .map(msg => String(msg.reactions || ''))
    .filter(reaction => reaction.trim()); // Filter out empty reactions
    
  if (allReactions.length === 0) {
    return '-';
  }
  
  return getReactionsEmoji(allReactions);
};
