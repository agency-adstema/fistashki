"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const SearchBar_1 = __importDefault(require("@/components/SearchBar"));
const useCart_1 = require("@/hooks/useCart");
const useWishlist_1 = require("@/hooks/useWishlist");
const shopNav_1 = require("@/lib/shopNav");
const Header = () => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const [mobileMenuOpen, setMobileMenuOpen] = (0, react_1.useState)(false);
    const [categoryNav, setCategoryNav] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let on = true;
        (0, shopNav_1.fetchCategoryNavLinks)().then((links) => {
            if (on && links)
                setCategoryNav(links);
        });
        return () => {
            on = false;
        };
    }, []);
    const navLinks = () => {
        const cats = categoryNav ?? (0, shopNav_1.getFallbackCategoryNavLinks)(t);
        return [...cats, { title: t('header.blog'), href: '/blog' }];
    };
    const { itemCount, toggleCart } = (0, useCart_1.useCart)();
    const { count: wishlistCount } = (0, useWishlist_1.useWishlist)();
    return ((0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium", children: [t('header.promo'), " ", (0, jsx_runtime_1.jsx)("strong", { children: "ORGANIC10" }), " ", t('header.discount')] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-card/95 backdrop-blur-md border-b border-border", children: [(0, jsx_runtime_1.jsxs)("div", { className: "container-narrow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between min-h-24 gap-4 py-2", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", className: "flex items-center flex-shrink-0", children: (0, jsx_runtime_1.jsx)("img", { src: "/logo-kb.png", alt: "Ku\u0107a Ba\u0161ta", className: "h-24 w-auto max-h-[7.5rem] sm:h-28 sm:max-h-32" }) }), (0, jsx_runtime_1.jsx)("div", { className: "hidden md:block flex-1 max-w-xl mx-4", children: (0, jsx_runtime_1.jsx)(SearchBar_1.default, {}) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: "/account/wishlist", className: "relative p-2 hover:bg-muted rounded-lg transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "w-5 h-5" }), wishlistCount > 0 && (0, jsx_runtime_1.jsx)("span", { className: "absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold", children: wishlistCount })] }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/account", className: "p-2 hover:bg-muted rounded-lg transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => toggleCart(true), className: "relative p-2 hover:bg-muted rounded-lg transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShoppingCart, { className: "w-5 h-5" }), itemCount > 0 && (0, jsx_runtime_1.jsx)("span", { className: "absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold", children: itemCount })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "md:hidden p-2 hover:bg-muted rounded-lg transition-colors", children: mobileMenuOpen ? (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-5 h-5" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { className: "w-5 h-5" }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "md:hidden pb-3", children: (0, jsx_runtime_1.jsx)(SearchBar_1.default, {}) })] }), (0, jsx_runtime_1.jsx)("nav", { className: "hidden md:block border-t border-border", children: (0, jsx_runtime_1.jsx)("div", { className: "container-narrow", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1 h-10 overflow-x-auto", children: navLinks().map(link => ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: link.href, className: "px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary whitespace-nowrap transition-colors", children: link.title }, link.href))) }) }) })] }), mobileMenuOpen && ((0, jsx_runtime_1.jsx)("div", { className: "md:hidden bg-card border-b border-border animate-slide-in", children: (0, jsx_runtime_1.jsx)("div", { className: "container-narrow py-4 space-y-1", children: navLinks().map(link => ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: link.href, onClick: () => setMobileMenuOpen(false), className: "block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors", children: link.title }, link.href))) }) }))] }));
};
exports.default = Header;
//# sourceMappingURL=Header.js.map