
import { SignIn, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/logo-dmaurel-white.svg" 
            alt="DMaurel - Desarrollo Web Profesional" 
            className="w-32 h-auto mx-auto mb-8"
          />
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-muted-foreground">
            Accede a tu cuenta para gestionar tus presupuestos
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-8 shadow-xl border border-border">
          <SignIn 
            routing="path" 
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            redirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
                formButtonPrimary: "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
                footerActionLink: "text-primary hover:text-primary/90",
                formFieldInput: "bg-input border-border text-foreground",
                formFieldLabel: "text-foreground",
                identityPreviewText: "text-foreground",
                formResendCodeLink: "text-primary hover:text-primary/90"
              },
              variables: {
                colorPrimary: "hsl(var(--primary))",
                colorBackground: "hsl(var(--background))",
                colorInputBackground: "hsl(var(--input))",
                colorInputText: "hsl(var(--foreground))",
                colorText: "hsl(var(--foreground))",
                colorTextSecondary: "hsl(var(--muted-foreground))",
                colorDanger: "hsl(var(--destructive))",
                colorSuccess: "hsl(var(--primary))",
                colorWarning: "hsl(var(--secondary))",
                colorNeutral: "hsl(var(--muted))",
                borderRadius: "0.5rem"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
