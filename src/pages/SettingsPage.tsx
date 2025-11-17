import { Box, Paper, Typography, TextField, Button, Divider, Stack, Alert } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    theme: 'light',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Settings
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 600 }}>
        {saved && <Alert severity="success">Settings saved successfully!</Alert>}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Account Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={settings.name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Preferences
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Theme"
              name="theme"
              select
              value={settings.theme}
              onChange={handleChange}
              SelectProps={{
                native: true,
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </TextField>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
