import { Typography, Paper, Box } from "@mui/material";

function Home() {
  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
      <Box textAlign="center">
        <Typography variant="h4" component="h2" gutterBottom>
          Welcome to the Home Page
        </Typography>
        <Typography variant="body1">
          This is a simple SPA built with React and React Router. Navigate using the menu above.
        </Typography>
      </Box>
    </Paper>
  );
}

export default Home;
