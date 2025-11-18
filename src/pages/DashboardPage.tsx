import { Box, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '@hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Market Status
              </Typography>
              <Typography variant="h5">Open</Typography>
              <Typography variant="body2" color="success.main">
                Markets are active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Portfolio Value
              </Typography>
              <Typography variant="h5">$12,500</Typography>
              <Typography variant="body2" color="success.main">
                +2.5% today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Orders
              </Typography>
              <Typography variant="h5">5</Typography>
              <Typography variant="body2" color="info.main">
                Monitor your trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your market data and activity will appear here. Connect to the backend API to see
              real-time updates.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
