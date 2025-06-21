import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { SetFullMode } from './pages/sets/modes/SetFullMode';
import { SetOnlyOpenQuestionsMode } from './pages/sets/modes/SetOnlyOpenQuestionsMode';
import { SetSpellingMode } from './pages/sets/modes/SetSpellingMode';
import { SetContent } from './pages/sets/SetContent';
import { SetEdit } from './pages/sets/SetEdit';
import { SetNew } from './pages/sets/SetNew';
import { Sets } from './pages/sets/Sets';
import { SignIn } from './pages/SignIn';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sign-in" element={<SignIn />} />

          <Route path="sets" element={<Sets />}>
            <Route path="new" element={<SetNew />} />
            <Route path=":setId/edit" element={<SetEdit />} />
            <Route path=":setId/spelling-mode" element={<SetSpellingMode />} />
            <Route path=":setId/full-mode" element={<SetFullMode />} />
            <Route path=":setId/only-open-questions-mode" element={<SetOnlyOpenQuestionsMode />} />
            <Route path=":setId/content" element={<SetContent />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
