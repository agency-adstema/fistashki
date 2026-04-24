import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchCategoryNavLinks,
  getFallbackCategoryNavLinks,
  type ShopNavLink,
} from '@/lib/shopNav';

export default function Footer() {
  const { t } = useTranslation();
  const [shopLinks, setShopLinks] = useState<ShopNavLink[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCategoryNavLinks().then((links) => {
      if (alive && links) setShopLinks(links);
    });
    return () => {
      alive = false;
    };
  }, []);

  const categories = shopLinks ?? getFallbackCategoryNavLinks(t);

  function onNewsletter(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <footer className="border-t border-border bg-muted/80 text-foreground">
      <div className="container-narrow py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <Leaf className="h-6 w-6 text-primary" />
              {t('footer.brand')}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">{t('footer.brand_tagline')}</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t('footer.shop')}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="transition-colors hover:text-primary">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t('footer.company')}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="transition-colors hover:text-primary">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-primary">
                  {t('header.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-primary">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="transition-colors hover:text-primary">
                  {t('footer.shipping_info')}
                </Link>
              </li>
              <li>
                <Link to="/returns" className="transition-colors hover:text-primary">
                  {t('footer.return_policy')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">{t('footer.newsletter')}</p>
            <p className="mb-3 text-sm text-muted-foreground">{t('footer.newsletter_desc')}</p>
            <form onSubmit={onNewsletter} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                placeholder={t('footer.newsletter_placeholder')}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {t('footer.join')}
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t('footer.copyright')}</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-primary">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-primary">
              {t('footer.terms')}
            </Link>
            <Link to="/cookies" className="hover:text-primary">
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
