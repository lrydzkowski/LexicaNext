import { links } from '@/config/links';
import { OpenQuestionsPracticePage } from '../../components/practice/OpenQuestionsPracticePage';
import { useRandomOpenQuestionsPractice } from '../../hooks/api';

export function RandomOpenQuestionsPracticePage() {
  return (
    <OpenQuestionsPracticePage
      sessionSetId="practice:random"
      title="Random 20 words"
      emptyMessage="Add words to start practicing"
      emptyAction={{ label: 'Add word', to: links.newWord.getUrl({}, { returnTo: links.practice.getUrl() }) }}
      usePracticeQuery={useRandomOpenQuestionsPractice}
    />
  );
}
