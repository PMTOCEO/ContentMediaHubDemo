import React from 'react';
import styles from '@/styles/card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className, title, style }: CardProps) {
  const cardClasses = `${styles.card} ${className || ''}`.trim();

  return (
    <div style={style} className={cardClasses}>
      {title && <h2 className={styles.cardTitle}>{title}</h2>}
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
}

export function CardHeader({ children }: CardHeaderProps) {
  return <div className={styles.cardHeader}>{children}</div>;
} 