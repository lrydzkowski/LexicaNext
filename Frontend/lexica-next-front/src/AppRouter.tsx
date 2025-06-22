import { BrowserRouter, Route, Routes } from 'react-router';
import NotRequireAuth from './auth/NotRequireAuth';
import RequireAuth from './auth/RequireAuth';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
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
          <Route
            path="sign-in"
            element={
              <NotRequireAuth>
                <SignInPage />
              </NotRequireAuth>
            }
          />

          <Route
            index
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="sets"
            element={
              <RequireAuth>
                <SetsPage />
              </RequireAuth>
            }
          />
          <Route
            path="sets/new"
            element={
              <RequireAuth>
                <SetNewPage />
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/edit"
            element={
              <RequireAuth>
                <SetEditPage />
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/content"
            element={
              <RequireAuth>
                <SetContentPage />
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/spelling-mode"
            element={
              <RequireAuth>
                <SetSpellingModePage />
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/only-open-questions-mode"
            element={
              <RequireAuth>
                <SetOnlyOpenQuestionsModePage />
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/full-mode"
            element={
              <RequireAuth>
                <SetFullModePage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
