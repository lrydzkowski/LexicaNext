import { BrowserRouter, Route, Routes } from 'react-router';
import NotRequireAuth from './components/auth/NotRequireAuth';
import RequireAuth from './components/auth/RequireAuth';
import { Layout } from './components/layout/Layout';
import { PageWithBreadcrumbs } from './components/layout/PageWithBreadcrumbs';
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
                <PageWithBreadcrumbs>
                  <SetsPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path="sets/new"
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetNewPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/edit"
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetEditPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/content"
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetContentPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/spelling-mode"
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetSpellingModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/only-open-questions-mode"
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetOnlyOpenQuestionsModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path="sets/:setId/full-mode"
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetFullModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
