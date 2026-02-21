import { Container, Row, Col, Card } from 'react-bootstrap';

function Contact() {
  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Contact Us</Card.Title>
              <Card.Text>
                Get in touch with us for any inquiries or feedback.
              </Card.Text>
              <Card.Text>
                Email: contact@example.com<br />
                Phone: (123) 456-7890
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Address</Card.Title>
              <Card.Text>
                123 Main Street<br />
                City, State 12345<br />
                Country
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Contact;
