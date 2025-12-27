export interface FormValues {
  setName: string;
  entries: FormEntry[];
}

export interface FormEntry {
  word: string;
  wordType: string;
  translations: FormTranslation[];
  exampleSentences: FormExampleSentence[];
}

export interface FormTranslation {
  name: string;
}

export interface FormExampleSentence {
  sentence: string;
}
