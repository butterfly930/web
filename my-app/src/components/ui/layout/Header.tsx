import { useEffect, useState } from "react";

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLoginClick = () => {},
  onSignupClick = () => {},
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hamburgerLineStyle: React.CSSProperties = {
    width: "25px",
    height: "3px",
    backgroundColor: "black",
    display: "block",
    transition: "0.3s",
  };

  const hrefStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
  };

  const hrefMobileSidebarMenuStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
    padding: "0.75rem 0",
    fontSize: "1.1rem",
  };

  return (
    <header
      className="bg-blue shadow"
      style={{ width: "100%", boxSizing: "border-box", position: "relative" }}
    >
      <div
        style={{
          width: "100%",
          padding: "1rem 1.5rem",
          boxSizing: "border-box",
          boxShadow: "0 3px 3px rgb(255, 255, 255)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Hamburger menu for mobile */}
          <button
            className="hamburger-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: isMobile ? "flex" : "none",
              flexDirection: "column",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "5px",
            }}
          >
            <span style={hamburgerLineStyle} />
            <span style={hamburgerLineStyle} />
            <span style={hamburgerLineStyle} />
          </button>

          <nav
            style={{
              display: isMobile ? (isMenuOpen ? "flex" : "none") : "flex",
              gap: "2rem",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              position: isMobile ? "fixed" : "static",
              top: isMobile ? "80px" : "auto",
              left: isMobile ? "0" : "auto",
              right: isMobile ? "0" : "auto",
              backgroundColor: isMobile ? "#ffffff" : "transparent",
              padding: isMobile ? "1rem" : "0",
              zIndex: isMobile ? 1000 : "auto",
            }}
          >
            <a href="#" style={hrefStyle}>Faqja Kryesore</a>
            <a href="#" style={hrefStyle}>Produktet</a>
            <a href="#" style={hrefStyle}>Rreth Nesh</a>
            <a href="#" style={hrefStyle}>Mënyrë Kontakti</a>
          </nav>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={onLoginClick} type="button">Login</button>
            <button onClick={onSignupClick} type="button">Sign Up</button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.5)",
            zIndex: 999,
          }}
        />
      )}
    </header>
  );
};

export default Header;
