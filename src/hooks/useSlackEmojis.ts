// Helper function to resolve emoji with alias support
export const resolveEmoji = (name: string, emojiMap: Record<string, any>) => {
  const value = emojiMap[name];

  if (!value) return null;

  // Handle alias: format
  if (typeof value === 'string' && value.startsWith('alias:')) {
    const alias = value.replace('alias:', '');
    return resolveEmoji(alias, emojiMap);
  }

  return value;
};
