import React, {Suspense} from "react";
const SkeletonPageLoader = React.lazy(() => import("~/components/system/skeletons/PageSkeletonLoader"));

const Help = () => {
  return(
    <section>
      <Suspense fallback={<SkeletonPageLoader />}>
        <h5>Help</h5>
      </Suspense>
    </section>
  );
};

export default Help;