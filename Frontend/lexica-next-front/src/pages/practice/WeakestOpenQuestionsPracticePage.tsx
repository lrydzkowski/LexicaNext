import { links } from '@/config/links';
import { OpenQuestionsPracticePage } from '../../components/practice/OpenQuestionsPracticePage';
import { useWeakestOpenQuestionsPractice } from '../../hooks/api';

export function WeakestOpenQuestionsPracticePage() {
  return (
    <OpenQuestionsPracticePage
      sessionSetId="practice:weakest"
      title="Weakest 20 words"
      emptyMessage="Practice some words first"
      emptyAction={{ label: 'Start random practice', to: links.randomOpenQuestionsPractice.getUrl() }}
      usePracticeQuery={useWeakestOpenQuestionsPractice}
    />
  );
}
