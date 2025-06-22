import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SetFullModePage } from './pages/sets/modes/SetFullModePage';
import { SetOnlyOpenQuestionsModePage } from './pages/sets/modes/SetOnlyOpenQuestionsModePage';
import { SetSpellingModePage } from './pages/sets/modes/SetSpellingModePage';
import { SetContentPage } from './pages/sets/SetContentPage';
import { SetEditPage } from './pages/sets/SetEditPage';
import { SetNewPage } from './pages/sets/SetNewPage';
import { SetsPage } from './pages/sets/SetsPage';
import { SignInPage } from './pages/SignInPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="sign-in" element={<SignInPage />} />

          <Route path="sets" element={<SetsPage />} />
          <Route path="sets/new" element={<SetNewPage />} />
          <Route path="sets/:setId/edit" element={<SetEditPage />} />
          <Route path="sets/:setId/content" element={<SetContentPage />} />
          <Route path="sets/:setId/spelling-mode" element={<SetSpellingModePage />} />
          <Route path="sets/:setId/only-open-questions-mode" element={<SetOnlyOpenQuestionsModePage />} />
          <Route path="sets/:setId/full-mode" element={<SetFullModePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
