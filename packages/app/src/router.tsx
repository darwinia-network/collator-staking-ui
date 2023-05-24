import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import Root from "./Root";
import NotFound from "./pages/NotFound";
import ErrorCatcher from "./pages/ErrorCatcher";
import { Protected } from "./components/Protected";

const LazyLoader = ({ fileName }: { fileName: string }) => {
  /* rollup is strict to dynamic imports
   refer https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations */
  const Component = lazy(() => import(`./pages/${fileName}.tsx`));
  return (
    <Suspense fallback={<div className="flex items-center justify-center mt-8">Loading...</div>}>
      <Component />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorCatcher />,
    children: [
      {
        index: true,
        element: <LazyLoader fileName={"Home"} />,
      },
      {
        path: "staking",
        element: (
          <Protected>
            <LazyLoader fileName={"Staking"} />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
