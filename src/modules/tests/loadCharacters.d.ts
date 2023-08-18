declare module "loadCharacters" {
  export function countCharacters(): Promise<void>;
  export function countComments(comments: string[]): Promise<void>;
  export function initialize(container: HTMLElement): void;
  export function fetchCharacters(): Promise<any[]>;
  // ... Other exports ...
}

  