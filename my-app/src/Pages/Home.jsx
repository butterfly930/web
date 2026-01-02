import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function Home() {

  return (
    <>
      <Header />
        <div style={{padding: "20px", backgroundColor: "#1a1a1a", width: "100%", boxSizing: "border-box"}}>
              <input
                        type="search"
                        className="search-input"
                        style={{width: "100%", maxWidth: "400px", textAlign:"left", border:"1px solid white", padding:"10px", borderRadius:"5px", color:"white", backgroundColor:"transparent", boxSizing: "border-box"}}
                        placeholder="Search products..."
        />
      </div>
      <div className="products-container">
        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>

        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>

        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>

        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>

        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>

        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>

        <Card style={{ backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444' }}>
          <Card.Img variant="top" src="https://via.placeholder.com/150" />
          <Card.Body>
            <Card.Title>Sample Product</Card.Title>
            <Card.Text>
              This is a brief description of the sample product.
            </Card.Text>
            <Button variant="primary">Buy Now</Button>
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </>
  )
}

export default Home;
