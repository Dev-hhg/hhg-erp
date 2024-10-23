'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { VendorContext } from '@/app/Context/vendorcontext';
import {
  getRefundVmData,
  getTransportRemaining,
} from '@/serverComponents/dbFunctions';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

const APP_VERSION = '5.0.4 (Release)';

const NavItem = ({ href, children, count, closeMenu }) => {
  const pathname = usePathname();
  return (
    <li>
      <Link href={href} onClick={closeMenu}>
        <div
          className={`flex items-center justify-between rounded-md p-2 ${pathname === href ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
        >
          <span>{children}</span>
          {count > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
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
      className="text-md mb-1 flex w-full items-center justify-between font-semibold uppercase text-gray-500 hover:text-gray-700"
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
    other: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    async function getData() {
      if (status === 'authenticated') {
        const today = new Date().toISOString().split('T')[0];
        const transportData = await getTransportRemaining({ date: today });
        setTransmemoCount(transportData[0].vendorcount);
        const vmData = await getRefundVmData();
        setVmCount(vmData.length);
      }
    }
    getData();
  }, [status]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (usePathname() === '/scan') return null;

  return (
    <>
      {/* Header for all devices */}
      <header className="fixed left-0 right-0 top-0 z-30 bg-white shadow-sm">
        <div className="flex items-center justify-between p-2 md:px-6">
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              className="mr-4 text-gray-500 hover:text-gray-700 md:hidden"
            >
              <Menu size={24} />
              <span className="sr-only">Toggle menu</span>
            </button>
            <img
              src="/images/hhglogo.jpeg"
              alt="HHG Logo"
              className="h-8 md:h-10"
            />
          </div>
          <h1 className="hidden text-xl font-bold text-gray-800 md:text-2xl">
            HHG ERP
          </h1>
          <span className="text-sm text-gray-500">v{APP_VERSION}</span>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white shadow-lg ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:w-1/5 md:translate-x-0 lg:w-1/6`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden border-b border-gray-200 md:flex md:h-16 md:items-center md:justify-center">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-20 md:pt-4">
            <NavSection
              title="Main"
              isOpen={openSections.main}
              toggleOpen={() => toggleSection('main')}
            >
              <NavItem href="/entry" closeMenu={closeMenu}>
                Todays Entries
              </NavItem>
              <NavItem href="/viewentries" closeMenu={closeMenu}>
                View Entries
              </NavItem>
              <NavItem
                href="/transportmemo"
                count={transmemoCount}
                closeMenu={closeMenu}
              >
                Transporter Memo
              </NavItem>
              <NavItem href="/vmdata" count={vmCount} closeMenu={closeMenu}>
                Vendor Memo
              </NavItem>
              <NavItem href="/findfarmer" closeMenu={closeMenu}>
                Find farmer data
              </NavItem>
            </NavSection>
            <NavSection
              title="Vendor Menu"
              isOpen={openSections.management}
              toggleOpen={() => toggleSection('management')}
            >
              <NavItem href="/addvendor" closeMenu={closeMenu}>
                Add new Vendor
              </NavItem>
              <NavItem href="/payment" closeMenu={closeMenu}>
                Add vendor Payment
              </NavItem>
              <NavItem href="/viewpayment" closeMenu={closeMenu}>
                Vendor Statement
              </NavItem>
            </NavSection>
            <NavSection
              title="Farmer Menu"
              isOpen={openSections.farmers}
              toggleOpen={() => toggleSection('farmers')}
            >
              <NavItem href="/addfarmer" closeMenu={closeMenu}>
                Add new Farmer
              </NavItem>
              <NavItem href="/advance" closeMenu={closeMenu}>
                Add advance
              </NavItem>
              <NavItem href="/viewfarmers" closeMenu={closeMenu}>
                View All farmers
              </NavItem>
            </NavSection>
            <NavSection
              title="Reports"
              isOpen={openSections.reports}
              toggleOpen={() => toggleSection('reports')}
            >
              <NavItem href="/reports" closeMenu={closeMenu}>
                Daily Market Rate
              </NavItem>
              <NavItem href="/reports1" closeMenu={closeMenu}>
                Daily Summary
              </NavItem>
              <NavItem href="/dailybook" closeMenu={closeMenu}>
                Daily Payment Book
              </NavItem>
            </NavSection>
            <NavSection
              title="Others"
              isOpen={openSections.other}
              toggleOpen={() => toggleSection('other')}
            >
              {/* <NavItem href="/farmconnect/dashboard" closeMenu={closeMenu}>Farm Connect</NavItem> */}
              <NavItem href="/extra" closeMenu={closeMenu}>
                Extras
              </NavItem>
            </NavSection>
          </nav>
          {session && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => signOut()}
                className="w-full rounded-md bg-indigo-600 p-2 text-white transition-colors duration-300 hover:bg-indigo-700"
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
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={toggleMenu}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}
