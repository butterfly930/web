import { useEffect, useState } from "react";
import "../../../index.css";

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

  return (
    <header className="bg-blue w-full box-border relative shadow-sm">
      <div className="w-full px-6 py-4 box-border flex justify-center">
        <div className="flex justify-between items-center w-full">
          {/* Hamburger menu for mobile */}
          <button
            className={`hamburger-menu flex-col gap-1 bg-transparent border-none cursor-pointer p-1.5 ${
              isMobile ? "flex" : "hidden"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="w-[25px] h-[3px] bg-black block transition-all duration-300" />
            <span className="w-[25px] h-[3px] bg-black block transition-all duration-300" />
            <span className="w-[25px] h-[3px] bg-black block transition-all duration-300" />
          </button>

          <nav
            className={`${
              isMobile
                ? isMenuOpen
                  ? "flex fixed top-[80px] left-0 right-0 bg-white p-4 z-[1000] flex-col items-start"
                  : "hidden"
                : "flex items-center"
            } gap-8`}
          >
            <a href="#" className="red-underline">Faqja Kryesore</a>
            <a href="#" className="red-underline">Produktet</a>
            <a href="#" className="red-underline">Rreth Nesh</a>
            <a href="#" className="red-underline">Mënyrë Kontakti</a>
          </nav>

          <div className="flex gap-4">
            <button onClick={onLoginClick} type="button">Login</button>
            <button onClick={onSignupClick} type="button">Sign Up</button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-white/50 z-[999]"
        />
      )}
    </header>
  );
};

export default Header;
