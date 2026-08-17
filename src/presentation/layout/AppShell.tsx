import {
  AppstoreOutlined,
  BarChartOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'

import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Space,
  Tag,
  type MenuProps,
} from 'antd'

import {
  useEffect,
  useState,
} from 'react'

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router'

import type {
  UserRole,
} from '../../domain/entities/CurrentUser'


const {
  Header,
  Content,
  Sider,
} = Layout


interface AppShellProps {
  currentUserEmail: string
  currentUserRole: UserRole | null
  onLogout: () => void
}


export function AppShell({
  currentUserEmail,
  currentUserRole,
  onLogout,
}: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [
    collapsed,
    setCollapsed,
  ] = useState(false)

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false)

  const screens =
    Grid.useBreakpoint()

  const isDesktop =
    screens.lg ?? true

  useEffect(() => {
    if (isDesktop) {
      setMobileMenuOpen(
        false,
      )
    }
  }, [
    isDesktop,
  ])

  const menuItems: MenuProps['items'] = [
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: 'Ürünler',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analitik',
    },
    {
      key: '/activity-logs',
      icon: <HistoryOutlined />,
      label: 'Aktiviteler',
    },
    ...(currentUserRole === 'admin'
      ? [
          {
            type: 'divider' as const,
          },
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: 'Kullanıcılar',
          },
        ]
      : []),
  ]

  const selectedKey =
    location.pathname.startsWith(
      '/profiles/',
    )
      ? '/users'
      : menuItems
          .flatMap((item) => {
            if (
              item !== null &&
              typeof item === 'object' &&
              'key' in item &&
              typeof item.key === 'string'
            ) {
              return [item.key]
            }

            return []
          })
          .find((key) => {
            return location.pathname
              .startsWith(key)
          }) ?? '/products'

  const accountItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profilim',
      onClick: () => {
        navigate('/profile')
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Çıkış yap',
      onClick: () => {
        onLogout()
        navigate(
          '/login',
          {
            replace: true,
          },
        )
      },
    },
  ]

  function navigateFromMenu(
    key: string,
    closeMobileMenu = false,
  ) {
    navigate(key)

    if (closeMobileMenu) {
      setMobileMenuOpen(
        false,
      )
    }
  }

  return (
    <Layout className="app-shell">
      {isDesktop && (
        <Sider
          className="app-sider"
          width={256}
          collapsedWidth={80}
          collapsed={collapsed}
          trigger={null}
        >
          <button
            className="brand"
            type="button"
            aria-label="Ürünlere git"
            onClick={() => {
              navigate('/products')
            }}
          >
            <span className="brand-mark">
              <ShopOutlined />
            </span>

            {!collapsed && (
              <span className="brand-copy">
                <strong>Envanter</strong>
                <small>Operasyon merkezi</small>
              </span>
            )}
          </button>

          <Menu
            className="app-menu"
            mode="inline"
            theme="dark"
            items={menuItems}
            selectedKeys={[
              selectedKey,
            ]}
            onClick={({ key }) => {
              navigateFromMenu(key)
            }}
          />

          {!collapsed && (
            <div className="sider-footnote">
              <span className="status-dot" />
              API bağlantısı hazır
            </div>
          )}
        </Sider>
      )}

      <Drawer
        className="mobile-nav-drawer"
        placement="left"
        width={280}
        open={mobileMenuOpen}
        title={
          <span className="drawer-brand">
            <span className="brand-mark">
              <ShopOutlined />
            </span>
            <span>
              <strong>Envanter</strong>
              <small>Operasyon merkezi</small>
            </span>
          </span>
        }
        onClose={() => {
          setMobileMenuOpen(
            false,
          )
        }}
      >
        <Menu
          className="app-menu"
          mode="inline"
          theme="dark"
          items={menuItems}
          selectedKeys={[
            selectedKey,
          ]}
          onClick={({ key }) => {
            navigateFromMenu(
              key,
              true,
            )
          }}
        />

        <div className="drawer-footnote">
          <span className="status-dot" />
          API bağlantısı hazır
        </div>
      </Drawer>

      <Layout>
        <Header className="app-header">
          <Button
            type="text"
            className="collapse-trigger"
            aria-label={
              !isDesktop || collapsed
                ? 'Menüyü aç'
                : 'Menüyü daralt'
            }
            icon={
              !isDesktop || collapsed
                ? <MenuUnfoldOutlined />
                : <MenuFoldOutlined />
            }
            onClick={() => {
              if (isDesktop) {
                setCollapsed(
                  (current) => !current,
                )
              } else {
                setMobileMenuOpen(
                  true,
                )
              }
            }}
          />

          <Dropdown
            menu={{
              items: accountItems,
            }}
            placement="bottomRight"
            trigger={[
              'click',
            ]}
          >
            <button
              className="account-menu"
              type="button"
            >
              <Avatar
                size={36}
                icon={<UserOutlined />}
              />

              <span className="account-copy">
                <strong>
                  {currentUserEmail}
                </strong>
                <Space size={6}>
                  <Tag
                    color={
                      currentUserRole === 'admin'
                        ? 'gold'
                        : 'blue'
                    }
                    bordered={false}
                  >
                    {currentUserRole === 'admin'
                      ? 'Yönetici'
                      : 'Kullanıcı'}
                  </Tag>
                </Space>
              </span>
            </button>
          </Dropdown>
        </Header>

        <Content className="app-content">
          <div className="content-frame">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
