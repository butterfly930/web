import Login from "../../common/Login";
import Signup from "../../common/Signup";

interface AuthModalProps {
  showLogin: boolean;
  showSignup: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  showLogin,
  showSignup,
  onClose,
}) => {
  if (!showLogin && !showSignup) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md my-8">
        {showLogin && <Login onClose={onClose} />}
        {showSignup && <Signup onClose={onClose} />}
      </div>
    </div>
  );
};

export default AuthModal;
