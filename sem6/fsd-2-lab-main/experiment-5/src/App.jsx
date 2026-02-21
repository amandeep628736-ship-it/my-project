import React, { lazy, Suspense, useState } from 'react';

const User = lazy(() => import('./User'));

function App() {
  const [load, setLoad] = useState(false);

  return (
    <div>
      <h1>Lazy Loading</h1>

      <button onClick={() => setLoad(true)}>
        Load User
      </button>

      {
        load ? (
          <Suspense fallback={<h3>loading...</h3>}>
            <User />
          </Suspense>
        ) : null
      }
    </div>
  );
}

export default App;
