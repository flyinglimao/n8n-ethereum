import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>

        {/* Disclaimer Warning */}
        <div style={{
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          margin: '2rem auto',
          maxWidth: '800px',
          textAlign: 'left',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{margin: '0 0 1rem 0', fontSize: '1.3rem'}}>
            ⚠️ Warning / 警告
          </h3>
          <p style={{margin: '0.5rem 0', fontSize: '0.95rem'}}>
            <strong>This package is in early development and has NOT been thoroughly tested or audited.</strong>
          </p>
          <p style={{margin: '0.5rem 0', fontSize: '0.95rem'}}>
            <strong>此套件處於早期開發階段，尚未經過完整測試或審核。</strong>
          </p>
          <ul style={{margin: '1rem 0 0.5rem 1.5rem', fontSize: '0.9rem'}}>
            <li>Not production-ready / 尚未準備好用於生產環境</li>
            <li>May contain bugs or security vulnerabilities / 可能包含錯誤或安全漏洞</li>
            <li>Always verify transactions before execution / 執行前請務必仔細檢查交易</li>
            <li>Test with small amounts first / 建議先使用小額測試</li>
          </ul>
          <p style={{margin: '1rem 0 0 0', fontSize: '0.85rem', fontStyle: 'italic'}}>
            Use at your own risk. You are solely responsible for any losses or damages.
            <br />
            請自行承擔使用風險及所有損失或損害的責任。
          </p>
        </div>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
