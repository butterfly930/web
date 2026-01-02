import { useState } from 'react';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return(
        <header className="bg-blue shadow" style={{width: "100%", boxSizing: "border-box", position: "relative"}}>
            <div style={{width: "100%", padding: "1rem 1.5rem", boxSizing: "border-box"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                    
                    {/* Hamburger menu for mobile */}
                    <button 
                        className="hamburger-menu"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            display: "none",
                            flexDirection: "column",
                            gap: "4px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px"
                        }}
                    >
                        <span style={{width: "25px", height: "3px", backgroundColor: "white", display: "block", transition: "0.3s"}}></span>
                        <span style={{width: "25px", height: "3px", backgroundColor: "white", display: "block", transition: "0.3s"}}></span>
                        <span style={{width: "25px", height: "3px", backgroundColor: "white", display: "block", transition: "0.3s"}}></span>
                    </button>

                    {/* Desktop Navigation - Left side */}
                    <nav className="desktop-nav" style={{display: "flex", gap: "2rem", alignItems: "center"}}>
                        <a href="#" className="text-white" style={{color: "white", textDecoration: "none"}}>Home</a>
                        <a href="#" style={{color: "white", textDecoration: "none"}}>Products</a>
                        <a href="#" style={{color: "white", textDecoration: "none"}}>About</a>
                        <a href="#" style={{color: "white", textDecoration: "none"}}>Contact</a>
                    </nav>

                    {/* Auth buttons - Right side */}
                    <div style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                        <button style={{padding: "0.5rem 1rem", cursor: "pointer"}}>Login</button>
                        <button style={{padding: "0.5rem 1rem", cursor: "pointer"}}>Sign Up</button>
                    </div>
                </div>

            </div>

            {/* Mobile Sidebar Menu */}
            <div 
                className="mobile-menu"
                style={{
                    position: "fixed",
                    top: 0,
                    left: isMenuOpen ? "0" : "-250px",
                    width: "250px",
                    height: "100vh",
                    backgroundColor: "#1a1a1a",
                    transition: "left 0.3s ease",
                    zIndex: 1000,
                    padding: "2rem 1rem",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem"
                }}
            >
                <button 
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        alignSelf: "flex-end",
                        background: "none",
                        border: "none",
                        color: "white",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        padding: "0.5rem"
                    }}
                >
                    ✕
                </button>
                <a href="#" onClick={() => setIsMenuOpen(false)} style={{color: "white", textDecoration: "none", padding: "0.75rem 0", fontSize: "1.1rem"}}>Home</a>
                <a href="#" onClick={() => setIsMenuOpen(false)} style={{color: "white", textDecoration: "none", padding: "0.75rem 0", fontSize: "1.1rem"}}>Products</a>
                <a href="#" onClick={() => setIsMenuOpen(false)} style={{color: "white", textDecoration: "none", padding: "0.75rem 0", fontSize: "1.1rem"}}>About</a>
                <a href="#" onClick={() => setIsMenuOpen(false)} style={{color: "white", textDecoration: "none", padding: "0.75rem 0", fontSize: "1.1rem"}}>Contact</a>
            </div>

            {/* Overlay */}
            {isMenuOpen && (
                <div 
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 999
                    }}
                />
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .hamburger-menu {
                        display: flex !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-menu {
                        display: none !important;
                    }
                }
            `}</style>
        </header>
    )
}
export default Header;