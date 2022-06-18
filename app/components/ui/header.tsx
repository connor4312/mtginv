import { useState } from "react";
import { NavLink } from "remix";
import * as Icon from "~/components/ui/icons";
import { classes } from "~/components/util/classes";
import { Container } from "./container";

const menuItems = [
  { name: "Home", route: "/" },
  { name: "Inventory", route: "/inventory" },
];

const menuLinkStyler = ({ isActive }: { isActive: boolean }) =>
  classes(
    "font-bold px-3 py-2 text-lg hover:text-sky-700",
    isActive ? "text-black" : "text-zinc-500"
  );

const mobileMenuLinkStyler = (v: { isActive: boolean }) =>
  classes(
    menuLinkStyler(v),
    "block px-0 border:zinc-600 border-t first:border-none"
  );

export const Header: React.FC<{ category: string }> = ({ category }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <Container className="border:zinc-600 mb-8 border-b py-6">
      <div className="flex items-center">
        <h1 className="flex-grow text-xl font-bold">
          <span className="text-black">mtginv</span>
          {category && <small className="block text-xs">{category}</small>}
        </h1>

        <div className="hidden sm:ml-6 sm:block">
          <div className="flex space-x-4">
            {menuItems.map(({ name, route }) => (
              <NavLink
                to={route}
                key={route}
                className={menuLinkStyler}
                end={route === "/"}
                aria-current="page"
              >
                {name}
              </NavLink>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-black hover:text-sky-700 focus:outline-none sm:hidden"
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? (
            <Icon.Close className="h-6 w-6" />
          ) : (
            <Icon.Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      <div className={isMenuOpen ? "sm:hidden" : "hidden"} id="mobile-menu">
        <div className="space-y-1 pt-4">
          {menuItems.map(({ name, route }) => (
            <NavLink
              to={route}
              key={route}
              className={mobileMenuLinkStyler}
              end={route === "/"}
              aria-current="page"
            >
              {name}
            </NavLink>
          ))}
        </div>
      </div>
    </Container>
  );
};
