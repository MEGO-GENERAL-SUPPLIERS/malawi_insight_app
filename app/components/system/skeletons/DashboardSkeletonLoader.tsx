import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const DashboardSkeletonLoader: React.FC = () => {
  return (
    <Box className="p-6" sx={{ width: '100%', minHeight: '85vh' }}>
      <Stack spacing={3}>
        {/* Page Title */}
        <Skeleton variant="text" height={40} width="35%" animation="pulse" />

        {/* Top stats cards */}
        <Box className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={120}
              animation="pulse"
              className="rounded-lg md:w-full"
            />
          ))}
        </Box>

        {/* Charts or Graph section */}
        <Box className="grid grid-cols-3 gap-4">
          <Skeleton variant="rectangular" height={280} className="col-span-2 rounded-xl" animation="pulse" />
          <Skeleton variant="rectangular" height={280} className="rounded-xl" animation="pulse" />
        </Box>

        {/* Activity or Table section */}
        <Skeleton variant="text" height={30} width="25%" animation="pulse" />
        <Skeleton variant="rectangular" height={200} animation="pulse" className="rounded-xl" />

        {/* Footer or summary */}
        <Skeleton variant="text" height={28} width="40%" animation="pulse" />
      </Stack>
    </Box>
  );
};

export default DashboardSkeletonLoader;
