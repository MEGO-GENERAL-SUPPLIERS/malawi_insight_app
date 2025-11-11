import React, { Suspense} from 'react';
const DashboardSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/DashboardSkeletonLoader"));

const Dashboard = () => {
  return (
    <section>
      <Suspense fallback={<DashboardSkeletonLoader />}>
        <h5>Dashboard</h5>
      </Suspense>
    </section>
  )
}

export default Dashboard