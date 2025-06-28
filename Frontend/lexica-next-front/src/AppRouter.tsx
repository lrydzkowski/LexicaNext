import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import NotRequireAuth from './components/auth/NotRequireAuth';
import RequireAuth from './components/auth/RequireAuth';
import { Layout } from './components/layout/Layout';
import { PageWithBreadcrumbs } from './components/layout/PageWithBreadcrumbs';
import { links } from './config/links';
import { AboutPage } from './pages/AboutPage';
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
            path={links.signIn.path}
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
                <Navigate to={links.sets.url} replace />
              </RequireAuth>
            }
          />
          <Route
            path={links.about.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <AboutPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.sets.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetsPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.newSet.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetNewPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.editSet.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetEditPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.setContent.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetContentPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.spellingMode.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetSpellingModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.onlyOpenQuestionsMode.path}
            element={
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetOnlyOpenQuestionsModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            }
          />
          <Route
            path={links.fullMode.path}
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
