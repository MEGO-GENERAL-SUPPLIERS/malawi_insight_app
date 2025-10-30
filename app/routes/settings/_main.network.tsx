import React, { useEffect, useState } from "react";
import { CellWifiRounded, SaveRounded, CloudDoneRounded } from "@mui/icons-material";
import { TextField, Box, CircularProgress, Typography, Paper, Stack, FormControl} from "@mui/material";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { testApiConnection } from "~/services/networkService";

const NetworkSettings: React.FC = () => {
  const [protocol, setProtocol] = useState("http");
  const [server, setServer] = useState("localhost");
  const [port, setPort] = useState("3000");
  const [base, setBase] = useState("api/v1");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const appData = localStorageUtils.ensureLocalAppStructure();
    const api = appData.api || {};
    setProtocol(api.protocol || protocol || "http");
    setServer(api.server || server || "localhost");
    setPort(api.port || port || "3000");
    setBase(api.base || base || "api/v1");
  }, []);

  // Save settings
  const handleSave = async() => {
    setIsLoading(true);
    try{
      const config = { protocol, server, port, base };
      localStorageUtils.addOrUpdateLocalStorageObject({ api: config });

      ToastAlertComponentController.show({
        icon: `TriangleAlert`,
        type: `success`,
        message: `API Configuration cached successfully. Testing Connection...`,
        autoHideDuration: 2500,
        positionX: `center`
      });
      setIsLoading(false);

      // Wait for 2 seconds before testing
      await new Promise((resolve) => setTimeout(resolve, 2500));

      await handleTest();
    }catch(error: any){
      setIsLoading(false);
      ToastAlertComponentController.show({
        type: `error`,
        icon: `XCircle`,
        message: `Failed to cache configurations: ${error.message}`
      });
    }
  };

  //hanlde test
  const handleTest = async() => {
    setIsTesting(true);
    const result = await testApiConnection();
    setIsTesting(false);
    if(result.success){
      ToastAlertComponentController.show({
        type: "success",
        icon: `CheckCircle`,
        message: `Connection successful! ${result.message || ""}`,
        animation: "slide",
        slideDirection: "up"
      });
    } else {
      ToastAlertComponentController.show({
        type: "error",
        icon: 'XCircle',
        message: `Connection failed: ${result.message}`
      });
    }
  };

  return(
    <section className="space-y-4 p-4">
      <Typography variant="h6" className="flex items-center gap-2 font-semibold">
        <CellWifiRounded className="info" /> {"Network Settings"}
      </Typography>
      

        <Paper elevation={1} className="p-6 rounded-md space-y-6 mt-6">
          <div className="flex flex-row items-center justify-between">
            <Typography className="font-semibold text-gray-900 dark:text-gray-100">
              API Configuration
            </Typography>

            {isTesting && (
              <Typography className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CircularProgress color="success" size={18} /> 
                  {"Testing Connection..."} 
              </Typography>  
            )}
          </div>

          <Stack spacing={3} className="mt-6">
            <FormControl>
              <TextField 
                label="Protocol"
                variant="outlined"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                fullWidth
              />
            </FormControl>

            <FormControl>
              <TextField 
                label="Host/Server"
                variant="outlined"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                fullWidth
              />
            </FormControl>

            <FormControl>
              <TextField 
                label="Port"
                variant="outlined"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                fullWidth
              />
            </FormControl>

            <FormControl>
              <TextField 
                label="Base Route"
                variant="outlined"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                fullWidth
              />
            </FormControl>
          </Stack>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading 
                ? <span className="space-y-4 flex gap-2"><CircularProgress  color="inherit" size={18} /> {"Saving..."}</span> 
                : <span><SaveRounded />{"Save & Test"} </span>}

            </button>

            <button
              className="btn btn-secondary"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting 
              ? <span className="space-y-4 flex gap-2"><CircularProgress color="inherit" size={18} /> {"Testing..."} </span> 
              : <span><CloudDoneRounded /> {"Test Connection"} </span> }
            </button>
          </Box>
        </Paper>

        <ToastAlertComponentController.render />
    </section>
  );
};

export default NetworkSettings;