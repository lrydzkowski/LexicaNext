import { OpenQuestionsPracticePage } from '../../components/practice/OpenQuestionsPracticePage';
import { useWeakestOpenQuestionsPractice } from '../../hooks/api';

export function WeakestOpenQuestionsPracticePage() {
  return (
    <OpenQuestionsPracticePage
      sessionSetId="practice:weakest"
      title="Weakest 20 words"
      usePracticeQuery={useWeakestOpenQuestionsPractice}
    />
  );
}
