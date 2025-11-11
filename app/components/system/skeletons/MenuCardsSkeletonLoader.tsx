import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const MenuCardsSkeletonLoader: React.FC = () => {
  return (
    <Box className="p-6" sx={{ width: '100%', minHeight: '85vh' }}>
      <Stack spacing={3}>
        {/* Page Title and Subtitle */}
        <Box>
          <Skeleton variant="text" height={40} width="25%" animation="pulse" />
          <Skeleton variant="text" height={28} width="50%" animation="pulse" />
        </Box>

        {/* First Row - 5 Menu Cards */}
        <Box className="flex flex-row flex-wrap gap-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              animation="pulse"
              className="rounded-lg"
              sx={{
                width: '22%',
                height: 140,
              }}
            />
          ))}
        </Box>

        {/* Second Row - 3 Menu Cards (aligned like the first 3 of first row) */}
        <Box className="flex flex-row justify-start gap-6 mt-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              animation="pulse"
              className="rounded-lg"
              sx={{
                width: '22%',
                height: 140,
              }}
            />
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default MenuCardsSkeletonLoader;
