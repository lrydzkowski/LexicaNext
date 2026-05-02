import { OpenQuestionsPracticePage } from '../../components/practice/OpenQuestionsPracticePage';
import { useWeakestOpenQuestionsPractice } from '../../hooks/api';

export function WeakestOpenQuestionsPracticePage() {
  return (
    <OpenQuestionsPracticePage
      sessionKey="practice:weakest-open-questions"
      title="Weakest 20 words"
      usePracticeQuery={useWeakestOpenQuestionsPractice}
    />
  );
}
