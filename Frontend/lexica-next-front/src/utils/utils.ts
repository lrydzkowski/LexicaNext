export const serialize = (translations: string[] | undefined): string => translations?.join(', ') || '';

const removePolishDiacritics = (text: string): string =>
  text
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z');

export const compareAnswers = (userAnswer: string, correctAnswers: string[]): boolean => {
  const userAnswers = userAnswer
    .split(',')
    .map((x) => removePolishDiacritics(x.trim().toLowerCase()))
    .sort();
  const processedCorrectAnswers = correctAnswers
    .map((correctAnswer) => removePolishDiacritics(correctAnswer.trim().toLowerCase()))
    .sort();
  const correct = userAnswers.join(',') === processedCorrectAnswers.join(',');

  return correct;
};
