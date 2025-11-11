import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const ProfilePageSkeletonLoader: React.FC = () => {
  return (
    <Box className="p-3" sx={{ width: '100%', minHeight: '98vh', bgcolor: '#f9fafb' }}>
      <Box className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        {/* Left Section */}
        <Box className="w-full md:w-1/4 flex flex-col items-center bg-white p-3 rounded-md shadow-sm">
          {/* Profile Image */}
          <Skeleton variant="circular" width={120} height={120} animation="wave" />

          {/* Name & Title */}
          <Stack spacing={1} sx={{ width: '100%', mt: 3 }}>
            <Skeleton variant="text" height={30} width="100%" animation="wave" />
            <Skeleton variant="text" height={20} width="95%" animation="wave" />
          </Stack>

          {/* Additional info lines */}
          <Stack spacing={1.5} sx={{ width: '100%', mt: 4 }}>
            <Skeleton variant="text" height={20} width="90%" animation="wave" />
            <Skeleton variant="text" height={20} width="85%" animation="wave" />
            <Skeleton variant="text" height={20} width="80%" animation="wave" />
            <Skeleton variant="text" height={20} width="60%" animation="wave" />
          </Stack>
        </Box>

        {/* Right Section */}
        <Box className="w-full md:w-3/4 flex flex-col bg-white p-4 rounded-md shadow-sm">
          {/* Top Header Block */}
          <Skeleton variant="rectangular" height={120} animation="wave" sx={{ borderRadius: 1 }} />

          {/* Text details below */}
          <Stack spacing={1.5} sx={{ mt: 4 }}>
            <Skeleton variant="text" height={28} width="75%" animation="wave" />
            <Skeleton variant="text" height={24} width="60%" animation="wave" />
            <Skeleton variant="text" height={24} width="50%" animation="wave" />
          </Stack>

          {/* Secondary content */}
          <Stack spacing={2.5} sx={{ mt: 4 }}>
            <Box className="flex flex-row space-x-4">
              <Skeleton variant="rectangular" height={100} className="md:w-1/3 md:h-[120px]" animation="wave" sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={100} className="md:w-1/3 md:h-[120px]" animation="wave" sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={100} className="md:w-1/3 md:h-[120px]" animation="wave" sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="rectangular" height={150} animation="wave" sx={{ borderRadius: 1 }} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePageSkeletonLoader;