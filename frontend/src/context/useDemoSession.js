import { useContext } from 'react';
import { DemoSessionContext } from './DemoSessionContext';

export function useDemoSession() {
  return useContext(DemoSessionContext);
}
