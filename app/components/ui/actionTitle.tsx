import React from 'react';
import { PageTitle } from './pageTitle';

export const ActionTitle: React.FC<{ title: string }> = ({title, children}) => <div className="flex">
  <PageTitle></PageTitle>
</div>
