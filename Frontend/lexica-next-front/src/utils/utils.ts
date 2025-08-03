export const serialize = (translations: string[] | undefined): string => translations?.join(', ') || '';

export const compareAnswers = (userAnswer: string, correctAnswers: string[]): boolean => {
  const userAnswers = userAnswer
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .sort();
  const processedCorrectAnswers = correctAnswers.map((correctAnswer) => correctAnswer.trim().toLowerCase()).sort();
  const correct = userAnswers.join(',') === processedCorrectAnswers.join(',');

  return correct;
};
