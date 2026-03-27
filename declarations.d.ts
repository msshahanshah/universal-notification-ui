declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "emoji-dictionary" {
  export interface EmojiDictionary {
    getUnicode(name: string): string;
    getName(unicode: string): string;
  }
  
  const emoji: EmojiDictionary;
  export default emoji;
}