import { OpenQuestionsPracticePage } from '../../components/practice/OpenQuestionsPracticePage';
import { useRandomOpenQuestionsPractice } from '../../hooks/api';

export function RandomOpenQuestionsPracticePage() {
  return (
    <OpenQuestionsPracticePage
      sessionKey="practice:random-open-questions"
      title="Random 20 words"
      usePracticeQuery={useRandomOpenQuestionsPractice}
    />
  );
}
