import { Typography, Paper, Box, Grid } from "@mui/material";

function About() {
  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" paragraph>
          This is the About page of our Single Page Application. We are a team dedicated to building modern web applications using React and various UI libraries.
        </Typography>
        <Typography variant="body1" paragraph>
          Our goal is to provide a seamless user experience with clean, responsive designs.
        </Typography>
      </Box>
    </Paper>
  );
}

export default About;
