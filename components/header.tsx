import Link from "next/link";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow transition-colors duration-300 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
            📚 Minha Biblioteca
          </Link>

          {/* Navegação + ThemeToggle */}
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Início</Button>
              </Link>
              <Link href="/books">
                <Button variant="ghost">Livros</Button>
              </Link>
              <Link href="/books/add">
                <Button variant="ghost">Adicionar Livro</Button>
              </Link>
            </nav>

            {/* Botão de alternar tema */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
