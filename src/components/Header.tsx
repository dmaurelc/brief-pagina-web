
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo-dmaurel-white.svg" 
              alt="DMaurel - Desarrollo Web Profesional" 
              className="w-32 h-auto cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Brief Página Web
            </div>
            
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Iniciar Sesión
                </Button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <div className="flex items-center space-x-2">
                {/* Navigation Menu for Signed In Users */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Mi Cuenta
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/my-account')}>
                      <User className="w-4 h-4 mr-2" />
                      Mi Cuenta
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Panel Admin
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
