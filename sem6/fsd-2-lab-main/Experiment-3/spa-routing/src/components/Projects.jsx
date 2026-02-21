import { Typography, Paper, Box, Card, CardContent, Grid } from "@mui/material";

function Projects() {
  const projectList = [
    {
      title: "Resume Webpage",
      description: "Developed using HTML and CSS in VS Code as a web development exercise."
    },
    {
      title: "Generative AI Case Study",
      description: "Group project on Software Test Case Generation, prepared and uploaded for your course deadline."
    },
    {
      title: "Student Management MVC",
      description: "Built an MVC app with Node.js/Express, MongoDB (via Compass), and Postman testing, including database setup and screenshots for submission."
    }
  ];

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          My Projects
        </Typography>
        <Grid container spacing={3}>
          {projectList.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography variant="body2">
                    {project.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}

export default Projects;
