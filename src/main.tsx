import {
  StrictMode,
} from 'react'

import {
  createRoot,
} from 'react-dom/client'

import {
  BrowserRouter,
} from 'react-router'

import {
  App as AntDesignApp,
  ConfigProvider,
} from 'antd'

import './index.css'
import './App.css'
import App from './App.tsx'

createRoot(
  document.getElementById(
    'root',
  )!,
).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          colorInfo: '#4f46e5',
          colorSuccess: '#0f9f6e',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 10,
          borderRadiusLG: 16,
          colorBgLayout: '#f5f7fb',
          colorText: '#172033',
          colorTextSecondary: '#687086',
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          controlHeight: 40,
          boxShadowSecondary:
            '0 18px 42px rgba(30, 41, 59, 0.12)',
        },
        components: {
          Button: {
            fontWeight: 600,
          },
          Card: {
            headerBg: '#ffffff',
          },
          Layout: {
            bodyBg: '#f5f7fb',
            headerBg: '#ffffff',
            siderBg: '#111827',
          },
          Menu: {
            darkItemBg: '#111827',
            darkItemSelectedBg: '#4f46e5',
            darkItemHoverBg: '#1f2937',
          },
        },
      }}
    >
      <AntDesignApp
        notification={{
          placement: 'topRight',
          duration: 4,
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntDesignApp>
    </ConfigProvider>
  </StrictMode>,
)
