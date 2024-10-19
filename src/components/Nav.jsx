"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { VendorContext } from "@/app/Context/vendorcontext";
import { getRefundVmData, getTransportRemaining } from "@/serverComponents/dbFunctions";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

const APP_VERSION = "5.0.4 (Release)";

const NavItem = ({ href, children, count, closeMenu }) => {
  const pathname = usePathname();
  return (
    <li>
      <Link href={href} onClick={closeMenu}>
        <div className={`flex items-center justify-between p-2 rounded-md ${pathname === href ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}>
          <span>{children}</span>
          {count > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-full">
              {count}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};

const NavSection = ({ title, children, isOpen, toggleOpen }) => (
  <div className="mb-4">
    <button 
      onClick={toggleOpen}
      className="flex items-center justify-between w-full mb-1 text-md font-semibold text-gray-500 uppercase hover:text-gray-700"
    >
      <span>{title}</span>
      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
    {isOpen && <ul className="space-y-1">{children}</ul>}
  </div>
);

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { isLogged, setIsLogged } = useContext(VendorContext);
  const [vmCount, setVmCount] = useState(0);
  const [transmemoCount, setTransmemoCount] = useState(0);

  const [openSections, setOpenSections] = useState({
    main: true,
    management: false,
    farmers: false,
    reports: false,
    other: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    async function getData() {
      if (status === "authenticated") {
        const today = new Date().toISOString().split("T")[0];
        const transportData = await getTransportRemaining({ date: today });
        setTransmemoCount(transportData[0].vendorcount);
        const vmData = await getRefundVmData();
        setVmCount(vmData.length);
      }
    }
    getData();
  }, [status]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (usePathname() === "/scan") return null;

  return (
    <>
      {/* Header for all devices */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
        <div className="flex items-center justify-between p-2 md:px-6">
          <div className="flex items-center">
            <button onClick={toggleMenu} className="md:hidden text-gray-500 hover:text-gray-700 mr-4">
              <Menu size={24} />
              <span className="sr-only">Toggle menu</span>
            </button>
            <img src="/images/hhglogo.jpeg" alt="HHG Logo" className="h-8 md:h-10" />
          </div>
          <h1 className="hidden text-xl md:text-2xl font-bold text-gray-800">HHG ERP</h1>
          <span className="text-sm text-gray-500">v{APP_VERSION}</span>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:w-1/5 lg:w-1/6`}>
        <div className="flex flex-col h-full">
          <div className="md:h-16 md:flex md:items-center md:justify-center border-b border-gray-200 hidden">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
          </div>
          <nav className="flex-1 px-4 pt-20 md:pt-4 pb-4 overflow-y-auto">
            <NavSection title="Main" isOpen={openSections.main} toggleOpen={() => toggleSection('main')}>
              <NavItem href="/entry" closeMenu={closeMenu}>Todays Entries</NavItem>
              <NavItem href="/viewentries" closeMenu={closeMenu}>View Entries</NavItem>
              <NavItem href="/transportmemo" count={transmemoCount} closeMenu={closeMenu}>Transporter Memo</NavItem>
              <NavItem href="/vmdata" count={vmCount} closeMenu={closeMenu}>Vendor Memo</NavItem>
			  <NavItem href="/findfarmer" closeMenu={closeMenu}>Find farmer data</NavItem>
            </NavSection>
            <NavSection title="Vendor Menu" isOpen={openSections.management} toggleOpen={() => toggleSection('management')}>
              <NavItem href="/addvendor" closeMenu={closeMenu}>Add new Vendor</NavItem>
              <NavItem href="/payment" closeMenu={closeMenu}>Add vendor Payment</NavItem>
              <NavItem href="/viewpayment" closeMenu={closeMenu}>Vendor Statement</NavItem>
            </NavSection>
            <NavSection title="Farmer Menu" isOpen={openSections.farmers} toggleOpen={() => toggleSection('farmers')}>
              <NavItem href="/addfarmer" closeMenu={closeMenu}>Add new Farmer</NavItem>
              <NavItem href="/advance" closeMenu={closeMenu}>Add advance</NavItem>
              <NavItem href="/viewfarmers" closeMenu={closeMenu}>View All farmers</NavItem>
            </NavSection>
            <NavSection title="Reports" isOpen={openSections.reports} toggleOpen={() => toggleSection('reports')}>
              <NavItem href="/reports" closeMenu={closeMenu}>Daily Market Rate</NavItem>
              <NavItem href="/reports1" closeMenu={closeMenu}>Daily Summary</NavItem>
              <NavItem href="/dailybook" closeMenu={closeMenu}>Daily Payment Book</NavItem>
            </NavSection>
            <NavSection title="Others" isOpen={openSections.other} toggleOpen={() => toggleSection('other')}>
              {/* <NavItem href="/farmconnect/dashboard" closeMenu={closeMenu}>Farm Connect</NavItem> */}
              <NavItem href="/extra" closeMenu={closeMenu}>Extras</NavItem>
            </NavSection>
          </nav>
          {session && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => signOut()}
                className="w-full p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleMenu}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}