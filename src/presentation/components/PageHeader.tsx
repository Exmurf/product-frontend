import type {
  ReactNode,
} from 'react'

import {
  Breadcrumb,
} from 'antd'


interface PageHeaderProps {
  section: string
  title: string
  description: ReactNode
  extra?: ReactNode
}


export function PageHeader({
  section,
  title,
  description,
  extra,
}: PageHeaderProps) {
  return (
    <header className="page-heading">
      <div className="page-heading-copy">
        <Breadcrumb
          className="page-breadcrumb"
          items={[
            {
              title: section,
            },
            {
              title: (
                <span aria-current="page">
                  {title}
                </span>
              ),
            },
          ]}
        />

        <p>{description}</p>
      </div>

      {extra}
    </header>
  )
}
