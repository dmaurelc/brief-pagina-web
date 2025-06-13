
import { SignUp, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-accent-700 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/logo-dmaurel-white.svg" 
            alt="DMaurel - Desarrollo Web Profesional" 
            className="w-32 h-auto mx-auto mb-8"
          />
          <h2 className="text-3xl font-medium text-foreground mb-2">
            Crear Cuenta
          </h2>
          <p className="text-muted-foreground">
            Regístrate para comenzar a crear tus briefs
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <SignUp 
            routing="path" 
            path="/auth/sign-up"
            signInUrl="/auth/sign-in"
            redirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "w-full",
                formButtonPrimary: "w-full bg-primary text-primary-foreground hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/90"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
