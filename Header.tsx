import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '@/components/SearchBar';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import {
  fetchCategoryNavLinks,
  getFallbackCategoryNavLinks,
  type ShopNavLink,
} from '@/lib/shopNav';

const Header = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryNav, setCategoryNav] = useState<ShopNavLink[] | null>(null);

  useEffect(() => {
    let on = true;
    fetchCategoryNavLinks().then((links) => {
      if (on && links) setCategoryNav(links);
    });
    return () => {
      on = false;
    };
  }, []);

  const navLinks = (): ShopNavLink[] => {
    const cats = categoryNav ?? getFallbackCategoryNavLinks(t);
    return [...cats, { title: t('header.blog'), href: '/blog' }];
  };
  const { itemCount, toggleCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50">
      {/* Promo bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium">
        {t('header.promo')} <strong>ORGANIC10</strong> {t('header.discount')}
      </div>

      {/* Main header */}
      <div className="bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container-narrow">
          <div className="flex items-center justify-between min-h-24 gap-4 py-2">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/logo-kb.png" alt="Kuća Bašta" className="h-24 w-auto max-h-[7.5rem] sm:h-28 sm:max-h-32" />
            </Link>

            {/* Search - desktop */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link to="/account/wishlist" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
              </Link>
              <Link to="/account" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={() => toggleCart(true)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search - mobile */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-border">
          <div className="container-narrow">
            <div className="flex items-center gap-1 h-10 overflow-x-auto">
              {navLinks().map(link => (
                <Link key={link.href} to={link.href} className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary whitespace-nowrap transition-colors">
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-slide-in">
          <div className="container-narrow py-4 space-y-1">
            {navLinks().map(link => (
              <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors">
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
