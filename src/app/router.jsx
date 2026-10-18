import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ClassroomRecorder } from '../features/recorder/components/ClassroomRecorder'
import { CoursesLibrary } from '../features/courses/components/CoursesLibrary'
import { CourseWorkspace } from '../features/notebooks/components/CourseWorkspace'
import { SettingsView } from '../features/settings/components/SettingsView'

export function createAppRouter({ currentTheme, onThemeChange, onToggleTheme }) {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <AppLayout
          currentTheme={currentTheme}
          onToggleTheme={onToggleTheme}
        />
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/notebooks" replace />,
        },
        {
          path: 'recorder',
          element: <ClassroomRecorder />,
        },
        {
          path: 'notebooks',
          element: <CoursesLibrary />,
        },
        {
          path: 'notebooks/:courseId',
          element: <CourseWorkspace />,
        },
        {
          path: 'settings',
          element: (
            <SettingsView
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
          ),
        },
        {
          path: '*',
          element: <Navigate to="/notebooks" replace />,
        },
      ],
    },
  ])
}

