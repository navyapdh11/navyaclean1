import React from 'react';
export default function NextLink({ children, href, ...props }: any) {
  return React.createElement('a', { href, ...props }, children);
}
