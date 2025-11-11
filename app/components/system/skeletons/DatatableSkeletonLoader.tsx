import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const DatatableSkeletonLoader: React.FC = () => {
  return (
    <Box className="p-6" sx={{ width: '100%', minHeight: '85vh' }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box>
          <Skeleton variant="text" height={40} width="30%" animation="pulse" />
          <Skeleton variant="text" height={24} width="50%" animation="pulse" />
        </Box>

        {/* Filter + Search Bar Section */}
        <Box className="flex flex-row justify-between items-center space-x-3">
          <Skeleton variant="rectangular" height={40} className="md:w-1/4" animation="pulse" />
          <Skeleton variant="rectangular" height={40} className="md:w-2/4" animation="pulse" />
          <Skeleton variant="rectangular" height={40} className="md:w-3/4" animation="pulse" />
          <Skeleton variant="rectangular" height={40} className="md:w-2/4" animation="pulse" />
        </Box>

        {/* Table Rows */}
        {[...Array(5)].map((_, rowIndex) => (
          <Box
            key={rowIndex}
            className="flex flex-row space-x-3 border-b border-gray-200 py-3"
          >
            {[...Array(4)].map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                className={`${colIndex == 0 && "md:w-1/4" } ${colIndex == 1 && "md:w-2/4" } ${colIndex == 2 && "md:w-3/4" } ${colIndex == 3 && "md:w-2/4" }`}
                height={28}
                animation="pulse"
              />
            ))}
          </Box>
        ))}

        {/* Pagination Footer */}
        <Box className="flex flex-row justify-between items-center mt-4">
          <Skeleton variant="text" width="20%" height={28} animation="pulse" />
          <Box className="flex flex-row space-x-3">
            <Skeleton variant="rectangular" width={32} height={32} animation="pulse" />
            <Skeleton variant="rectangular" width={32} height={32} animation="pulse" />
            <Skeleton variant="rectangular" width={32} height={32} animation="pulse" />
            <Skeleton variant="rectangular" width={32} height={32} animation="pulse" />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default DatatableSkeletonLoader;