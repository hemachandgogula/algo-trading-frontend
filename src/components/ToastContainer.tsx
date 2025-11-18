import { Stack, Alert, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useToastStore } from '@store/toastStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <Stack
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: (theme) => theme.zIndex.snackbar,
        gap: 1,
        maxWidth: 400,
      }}
    >
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          severity={toast.type}
          sx={{
            minWidth: 300,
            boxShadow: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideIn 0.3s ease-in-out',
            '@keyframes slideIn': {
              from: {
                transform: 'translateX(400px)',
                opacity: 0,
              },
              to: {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
          }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {toast.action && (
                <Box
                  component="button"
                  onClick={toast.action.callback}
                  sx={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    p: 0,
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  {toast.action.label}
                </Box>
              )}
              <IconButton
                size="small"
                onClick={() => removeToast(toast.id)}
                sx={{ color: 'inherit' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          {toast.message}
        </Alert>
      ))}
    </Stack>
  );
};
