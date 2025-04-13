import TopBar from '@/components/TopBar';
import React from 'react';

const UserConfig: React.FC = () => {
  return (
    <>
    <TopBar/>
      <button>Edit profile (appear only when this is your page)</button>
    </>
  );
};

export default UserConfig;
