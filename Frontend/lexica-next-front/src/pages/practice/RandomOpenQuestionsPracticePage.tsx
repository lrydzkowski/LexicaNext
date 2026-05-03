import { OpenQuestionsPracticePage } from '../../components/practice/OpenQuestionsPracticePage';
import { useRandomOpenQuestionsPractice } from '../../hooks/api';

export function RandomOpenQuestionsPracticePage() {
  return (
    <OpenQuestionsPracticePage
      sessionSetId="practice:random"
      title="Random 20 words"
      usePracticeQuery={useRandomOpenQuestionsPractice}
    />
  );
}
