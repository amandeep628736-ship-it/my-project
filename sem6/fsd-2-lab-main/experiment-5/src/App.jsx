import React, { lazy, Suspense } from 'react';
import Text from './Text';

const Image = lazy(() => import('./Image'));

function App() {
  return (
    <div>
      <h1>React App with Lazy Loaded Image and Immediate Text</h1>
      <Text />
      <Suspense fallback={<h3>Loading image...</h3>}>
        <Image />
      </Suspense>
    </div>
  );
}

export default App;
