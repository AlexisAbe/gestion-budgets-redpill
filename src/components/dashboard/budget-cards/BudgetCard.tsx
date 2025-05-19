
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BudgetCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function BudgetCard({ title, icon, children, className = '' }: BudgetCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
