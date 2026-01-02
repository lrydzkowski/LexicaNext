export interface WordFormValues {
  word: string;
  wordType: string;
  translations: { name: string; key: string }[];
  exampleSentences: { sentence: string; key: string }[];
}

export interface WordFormSuccessData {
  wordId: string;
  word: string;
  wordType: string;
}
