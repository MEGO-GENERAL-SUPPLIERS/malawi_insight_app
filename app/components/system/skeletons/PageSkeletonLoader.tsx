import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const PageSkeletonLoader: React.FC = () => {
  return (
    <Box className="p-6" sx={{ width: '100%', minHeight: '80vh' }}>
      <Stack spacing={2}>
        {/* Page Title */}
        <Skeleton variant="text" height={40} animation="pulse" />
        
        {/* Subtitle / Description */}
        <Skeleton variant="text" width="60%" height={28} animation="pulse" />

        {/* Card grid or main content */}
        <Skeleton variant="rectangular" height={100} animation="pulse" />
        <Box className="flex flex-row space-x-5">
          <Skeleton variant="rectangular" height={100} width={"33%"} animation="pulse" />
          <Skeleton variant="rectangular" height={100} width={"33%"} animation="pulse" />
          <Skeleton variant="rectangular" height={100} width={"33%"} animation="pulse" />
        </Box>
        <Skeleton variant="rectangular" height={100} animation="pulse" />

        {/* Footer / extra content */}
        <Skeleton variant="text" width="40%" height={28} animation="pulse" />
      </Stack>
    </Box>
  );
};

export default PageSkeletonLoader;