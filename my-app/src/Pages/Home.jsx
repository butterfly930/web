import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories') ? searchParams.get('categories').split(',') : []
  );
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get('brands') ? searchParams.get('brands').split(',') : []
  );
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedCard, setSelectedCard] = useState(null);

  const categories = ['Order', 'Preorder', 'New'];
  const brands = ['Samsung', 'Apple', 'Xiaomi'];

  // Determine responsive properties based on screen width
  const getResponsiveValues = (width) => {
    let maxWidth = "1200px";
    let gridCols = "repeat(auto-fill, minmax(240px, 1fr))";
    let cardImageHeight = "200px";
    let padding = "15px";
    let gap = "20px";
    let fontSize = "16px";
    let fontSizeSmall = "14px";

    if (width < 768) {
      // Mobile
      gridCols = "repeat(auto-fill, minmax(150px, 1fr))";
      cardImageHeight = "130px";
      gap = "12px";
      fontSize = "14px";
      fontSizeSmall = "12px";
    } else if (width < 1024) {
      // Tablet
      maxWidth = "100%";
      gridCols = "repeat(auto-fill, minmax(200px, 1fr))";
      cardImageHeight = "160px";
      padding = "15px";
      fontSize = "15px";
      fontSizeSmall = "13px";
    } else if (width < 1440) {
      // Small Desktop
      maxWidth = "1200px";
      gridCols = "repeat(auto-fill, minmax(240px, 1fr))";
      cardImageHeight = "200px";
    } else if (width < 1920) {
      // Medium Desktop (14.9" and similar)
      maxWidth = "1400px";
      gridCols = "repeat(auto-fill, minmax(280px, 1fr))";
      cardImageHeight = "220px";
      fontSize = "17px";
      fontSizeSmall = "15px";
      gap = "24px";
    } else {
      // Large Desktop (4K and above)
      maxWidth = "1600px";
      gridCols = "repeat(auto-fill, minmax(300px, 1fr))";
      cardImageHeight = "240px";
      fontSize = "18px";
      fontSizeSmall = "16px";
      gap = "28px";
      padding = "20px";
    }

    return { maxWidth, gridCols, cardImageHeight, padding, gap, fontSize, fontSizeSmall };
  };

  const responsive = getResponsiveValues(windowWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize products
  useEffect(() => {
    fetch('/mock.json')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (priceRange !== 'all') params.set('price', priceRange);
    
    setSearchParams(params);
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, setSearchParams]);

  // Filter products based on all criteria
  useEffect(() => {
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand)
      );
    }

    // Filter by price
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        switch (priceRange) {
          case '0-300':
            return product.price <= 300;
          case '300-700':
            return product.price > 300 && product.price <= 700;
          case '700+':
            return product.price > 700;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, selectedBrands, priceRange]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange('all');
  };

  const filterSection = (
    <div style={{
      backgroundColor: "#2c2c2c",
      padding: isMobile ? "12px" : "20px",
      borderRadius: "8px",
      border: "1px solid #444",
      height: "fit-content",
      width: isMobile ? "100%" : windowWidth < 1440 ? "250px" : "280px"
    }}>
      <h4 style={{ color: "white", marginBottom: "20px", fontSize: isMobile ? "16px" : responsive.fontSize }}>Filters</h4>

      {/* Category Filters */}
      <div style={{ marginBottom: "25px" }}>
        <h5 style={{ color: "white", fontSize: responsive.fontSizeSmall, marginBottom: "10px" }}>Category</h5>
        {categories.map(category => (
          <div key={category} style={{ marginBottom: "8px" }}>
            <label style={{ color: "#bbb", cursor: "pointer", display: "flex", alignItems: "center", fontSize: responsive.fontSizeSmall }}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                style={{ marginRight: "8px", cursor: "pointer" }}
              />
              {category}
            </label>
          </div>
        ))}
      </div>

      {/* Brand Filters */}
      <div style={{ marginBottom: "25px" }}>
        <h5 style={{ color: "white", fontSize: responsive.fontSizeSmall, marginBottom: "10px" }}>Brand</h5>
        {brands.map(brand => (
          <div key={brand} style={{ marginBottom: "8px" }}>
            <label style={{ color: "#bbb", cursor: "pointer", display: "flex", alignItems: "center", fontSize: responsive.fontSizeSmall }}>
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                style={{ marginRight: "8px", cursor: "pointer" }}
              />
              {brand}
            </label>
          </div>
        ))}
      </div>

      {/* Price Filters */}
      <div style={{ marginBottom: "25px" }}>
        <h5 style={{ color: "white", fontSize: responsive.fontSizeSmall, marginBottom: "10px" }}>Price</h5>
        {[
          { value: 'all', label: 'All Prices' },
          { value: '0-300', label: '$0 - $300' },
          { value: '300-700', label: '$300 - $700' },
          { value: '700+', label: '$700+' }
        ].map(option => (
          <div key={option.value} style={{ marginBottom: "8px" }}>
            <label style={{ color: "#bbb", cursor: "pointer", display: "flex", alignItems: "center", fontSize: responsive.fontSizeSmall }}>
              <input
                type="radio"
                name="price"
                value={option.value}
                checked={priceRange === option.value}
                onChange={(e) => setPriceRange(e.target.value)}
                style={{ marginRight: "8px", cursor: "pointer" }}
              />
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {/* Clear Filters Button */}
      <Button
        onClick={clearFilters}
        variant="secondary"
        style={{ width: "100%", marginTop: "10px", fontSize: responsive.fontSizeSmall, padding: "8px" }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#1a1a1a", minHeight: "100vh", paddingTop: "15px", paddingBottom: "20px" }}>
        {/* Search Bar */}
        <div style={{ maxWidth: responsive.maxWidth, margin: "0 auto", marginBottom: "20px", paddingLeft: responsive.padding, paddingRight: responsive.padding }}>
          <input
            type="search"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "100%",
              textAlign: "left",
              border: "1px solid white",
              padding: "10px 12px",
              borderRadius: "5px",
              color: "white",
              backgroundColor: "transparent",
              boxSizing: "border-box",
              fontSize: responsive.fontSize
            }}
            placeholder="Search products..."
          />
        </div>

        {/* Filter Toggle Button for Mobile */}
        {isMobile && (
          <div style={{ maxWidth: responsive.maxWidth, margin: "0 auto", paddingLeft: responsive.padding, paddingRight: responsive.padding, marginBottom: "15px" }}>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline-light"
              style={{ width: "100%", fontSize: responsive.fontSizeSmall }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        )}

        <div style={{
          maxWidth: responsive.maxWidth,
          margin: "0 auto",
          display: "flex",
          gap: responsive.gap,
          paddingLeft: responsive.padding,
          paddingRight: responsive.padding,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "flex-start"
        }}>
          {/* Filters Sidebar - Hidden on Mobile by Default */}
          {(!isMobile || showFilters) && filterSection}

          {/* Products Grid */}
          <div style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                color: "white",
                textAlign: "center",
                padding: "30px 20px",
                backgroundColor: "#2c2c2c",
                borderRadius: "8px",
                border: "1px solid #444",
                fontSize: responsive.fontSizeSmall
              }}>
                <h4 style={{ marginBottom: "10px", fontSize: responsive.fontSize }}>No products found</h4>
                <p>Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <>
                <p style={{ color: "#bbb", marginBottom: "20px", fontSize: responsive.fontSizeSmall }}>
                  Showing {filteredProducts.length} of {products.length} products
                </p>
                <div className="products-container" style={{
                  display: "grid",
                  gridTemplateColumns: responsive.gridCols,
                  gap: responsive.gap,
                  width: "100%"
                }}>
                  {filteredProducts.map(product => (
                    <Card
                      key={product.id}
                      style={{
                        backgroundColor: '#2c2c2c',
                        color: 'white',
                        border: selectedCard === product.id ? '2px solid #4CAF50' : '1px solid #444',
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease",
                        cursor: "pointer",
                        boxShadow: selectedCard === product.id 
                          ? "0 0 20px rgba(76, 175, 80, 0.6), 0 8px 20px rgba(76, 175, 80, 0.3)" 
                          : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCard !== product.id) {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 12px 24px rgba(76, 175, 80, 0.4), 0 8px 16px rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.border = "1px solid #66bb6a";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCard !== product.id) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.border = "1px solid #444";
                        }
                      }}
                      onClick={() => setSelectedCard(selectedCard === product.id ? null : product.id)}
                    >
                      <Card.Img
                        variant="top"
                        src={product.image}
                        style={{
                          height: responsive.cardImageHeight,
                          objectFit: "cover"
                        }}
                      />
                      <Card.Body style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        padding: isMobile ? "12px" : "15px"
                      }}>
                        <Card.Title style={{
                          marginBottom: "8px",
                          fontSize: responsive.fontSize,
                          lineHeight: "1.2"
                        }}>
                          {product.name}
                        </Card.Title>
                        <Card.Text style={{
                          marginBottom: "10px",
                          flex: 1,
                          fontSize: responsive.fontSizeSmall,
                          lineHeight: "1.3"
                        }}>
                          {product.description}
                        </Card.Text>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "auto",
                          gap: "8px",
                          flexWrap: "wrap"
                        }}>
                          <span style={{
                            fontSize: responsive.fontSize,
                            fontWeight: "bold",
                            color: "#4CAF50"
                          }}>
                            ${product.price}
                          </span>
                          <Button
                            variant="primary"
                            style={{
                              fontSize: responsive.fontSizeSmall,
                              padding: isMobile ? "5px 10px" : "8px 14px"
                            }}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home;
