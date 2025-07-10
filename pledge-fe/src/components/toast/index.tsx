import * as React from 'react';
import { useEffect, useState } from "react";
import styles from './index.module.scss';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function Toast(props: any) {
  //toastMessage.type: success, error, warning, info
  const { toastMessage, callbackToast } = props;
  const [open, setOpen] = useState<any>(false);

  useEffect(() => {
    if (toastMessage && toastMessage.open) {
      setOpen(true);
    }
  }, [toastMessage])

  return (
    open && <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={(e, reason) => {
        // console.log(e, reason);
        if (reason === 'clickaway') {
          return;
        }

        setOpen(false);
        callbackToast();
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={toastMessage.type}>{toastMessage.message}</Alert>
    </Snackbar>
  );
}