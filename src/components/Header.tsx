
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useClerk,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, User, LogOut, Home, FileText } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut(() => navigate("/"));
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <img
              src="/logo-dmaurel-white.svg"
              alt="DMaurel - Desarrollo Web Profesional"
              className="w-32 h-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Brief Página Web
            </div>

            <SignedOut>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">Comenzar Ahora</Button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center space-x-2">
                {/* Navigation Menu for Signed In Users */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {isAdmin ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        "Menú"
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="w-4 h-4 mr-2" />
                      Inicio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-account")}>
                      <User className="w-4 h-4 mr-2" />
                      Mi Cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/brief")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Nuevo Presupuesto
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                          <Shield className="w-4 h-4 mr-2" />
                          Dashboard Admin
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
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
