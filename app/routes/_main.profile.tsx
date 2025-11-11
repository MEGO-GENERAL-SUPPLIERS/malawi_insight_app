import React, { Suspense} from "react";
const ProfilePageSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/ProfilePageSkeletonLoader"));

const Profile = () => {
  return(
    <section>
      <Suspense fallback={<ProfilePageSkeletonLoader />}>
      <h5>Profile</h5>
      </Suspense>
    </section>
  );
};

export default Profile;